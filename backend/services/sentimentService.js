/**
 * ============================================================
 *  SERVICE: Sentiment Analysis
 * ============================================================
 *  Pendekatan hybrid:
 *  1. Library `sentiment` untuk bahasa Inggris (AFINN-165 lexicon)
 *  2. Custom Indonesian lexicon untuk komentar berbahasa Indonesia
 *
 *  Output untuk tiap komentar:
 *    { sentiment: 'positive'|'neutral'|'negative', score, comparative }
 * ============================================================
 */

const Sentiment = require('sentiment');

// ───── Lexicon Bahasa Indonesia ───────────────────────────
// Skor: -5 (sangat negatif) sampai +5 (sangat positif)
const indonesianLexicon = {
  // Positif
  baik: 3, bagus: 4, mantap: 4, mantul: 4, keren: 4, hebat: 4,
  suka: 3, cinta: 4, sayang: 3, senang: 3, gembira: 3, lucu: 2,
  menarik: 3, indah: 3, sempurna: 5, kreatif: 3, inspiratif: 4,
  inspirasi: 3, membantu: 3, bermanfaat: 4, top: 3, mantab: 4,
  wow: 3, asik: 3, asyik: 3, enak: 3, cakep: 3, jago: 3, juara: 4,
  cantik: 3, ganteng: 3, tampan: 3, ramah: 3, sopan: 3, jujur: 3,
  pintar: 3, cerdas: 4, pandai: 3, rajin: 3, sukses: 4, berhasil: 3,
  setuju: 2, benar: 2, terbaik: 5, favorit: 3, oke: 2, sip: 2,
  semangat: 3, hore: 3, yeay: 3, selamat: 2, terima: 1, kasih: 2,
  bahagia: 4, gokil: 3, bismillah: 1, alhamdulillah: 3, masyaallah: 3,
  
  // Negatif
  buruk: -3, jelek: -3, parah: -3, sampah: -4, bodoh: -4, dungu: -4,
  goblok: -4, tolol: -4, idiot: -4, benci: -4, kecewa: -3, sedih: -2,
  marah: -3, kesal: -3, kesel: -3, jijik: -4, norak: -3, alay: -2,
  gagal: -3, rusak: -3, bohong: -3, dusta: -3, penipu: -4, scam: -4,
  menyebalkan: -3, menyesal: -3, lambat: -2, mahal: -2,
  mengecewakan: -3, busuk: -3, anjing: -4, bangsat: -4, kampret: -3,
  najis: -3, sialan: -3, brengsek: -4, lebay: -2, ribet: -2,
  hoax: -3, hoaks: -3, palsu: -3, curang: -3, korup: -4, korupsi: -4,
  malas: -2, capek: -1, lelah: -1, susah: -2, sulit: -2, masalah: -2,
  jangan: -1, salah: -2, kurang: -1, telat: -2, kacau: -3, hancur: -3,
  takut: -2, gelisah: -2, cemas: -2, khawatir: -2, ngeri: -2,
  ngamuk: -3, jengkel: -3, nyebelin: -3,
  
  // Modifier
  tidak: -1, gak: -1, nggak: -1, ngga: -1, ga: -1, bukan: -1,
  banget: 1, sekali: 1, sangat: 1, paling: 1, super: 2,
};

const sentiment = new Sentiment();
sentiment.registerLanguage('id', { labels: indonesianLexicon });

/**
 * Deteksi sederhana: cek apakah teks dominan Bahasa Indonesia.
 * Heuristik: hitung kata Indonesia umum.
 */
const COMMON_ID_WORDS = new Set([
  'yang', 'untuk', 'dengan', 'ini', 'itu', 'di', 'ke', 'dari',
  'dan', 'atau', 'tapi', 'tetapi', 'karena', 'jika', 'kalau',
  'akan', 'sudah', 'sedang', 'masih', 'belum', 'tidak', 'gak',
  'saya', 'aku', 'kamu', 'kita', 'kami', 'mereka', 'dia',
  'sangat', 'banget', 'sekali', 'juga', 'lagi', 'kok', 'sih',
  'dong', 'deh', 'lah', 'nya', 'aja', 'doang', 'gimana',
]);

function isIndonesian(text) {
  const words = text.toLowerCase().split(/\s+/);
  if (words.length === 0) return false;
  const matches = words.filter(w => COMMON_ID_WORDS.has(w)).length;
  return matches / words.length > 0.1;     // 10% kata Indonesia → anggap Indo
}

/**
 * Analisis satu komentar.
 * Strategi: analisa dengan kedua bahasa lalu jumlahkan skornya.
 */
function analyzeComment(text) {
  const en = sentiment.analyze(text);
  const id = sentiment.analyze(text, { language: 'id' });

  const score = en.score + id.score;
  const tokens = (en.tokens?.length || 1) + (id.tokens?.length || 0);
  const comparative = score / Math.max(tokens, 1);

  let label;
  if (score > 0) label = 'positive';
  else if (score < 0) label = 'negative';
  else label = 'neutral';

  return { sentiment: label, score, comparative };
}

/**
 * Analisis batch + hitung statistik agregat.
 */
function analyzeBatch(comments) {
  const analyzed = comments.map(c => ({
    ...c,
    ...analyzeComment(c.text || ''),
  }));

  const statistics = calculateStatistics(analyzed);
  return { comments: analyzed, statistics };
}

/**
 * Hitung statistik deskriptif: persentase sentimen, rata-rata, median, std dev.
 */
function calculateStatistics(comments) {
  const total = comments.length;
  if (total === 0) return null;

  const positive = comments.filter(c => c.sentiment === 'positive').length;
  const neutral = comments.filter(c => c.sentiment === 'neutral').length;
  const negative = comments.filter(c => c.sentiment === 'negative').length;

  const scores = comments.map(c => c.score);
  const likes = comments.map(c => c.likes || 0);

  const avgScore = scores.reduce((a, b) => a + b, 0) / total;
  const avgLikes = likes.reduce((a, b) => a + b, 0) / total;
  const totalLikes = likes.reduce((a, b) => a + b, 0);

  // Median
  const sortedScores = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sortedScores.length / 2);
  const medianScore = sortedScores.length % 2 === 0
    ? (sortedScores[mid - 1] + sortedScores[mid]) / 2
    : sortedScores[mid];

  // Standar deviasi
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / total;
  const stdDevScore = Math.sqrt(variance);

  return {
    totalComments: total,
    totalLikes,
    avgLikes: parseFloat(avgLikes.toFixed(2)),
    avgScore: parseFloat(avgScore.toFixed(3)),
    medianScore: parseFloat(medianScore.toFixed(3)),
    stdDevScore: parseFloat(stdDevScore.toFixed(3)),
    positiveCount: positive,
    neutralCount: neutral,
    negativeCount: negative,
    positivePercent: parseFloat(((positive / total) * 100).toFixed(2)),
    neutralPercent: parseFloat(((neutral / total) * 100).toFixed(2)),
    negativePercent: parseFloat(((negative / total) * 100).toFixed(2)),
  };
}

module.exports = {
  analyzeComment,
  analyzeBatch,
  calculateStatistics,
  isIndonesian,
};
