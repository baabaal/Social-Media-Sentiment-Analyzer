/**
 * ============================================================
 *  SERVICE: Generic Crawler (Instagram / TikTok / Threads)
 * ============================================================
 *  PENTING: Platform-platform ini TIDAK menyediakan API publik
 *  untuk mengambil komentar pihak ketiga. Opsi yang tersedia:
 *
 *  1. LAYANAN PIHAK KETIGA (recommended untuk production):
 *     - Apify         → https://apify.com (banyak actor siap pakai)
 *     - Bright Data   → https://brightdata.com
 *     - ScrapeCreators→ https://scrapecreators.com
 *     - RapidAPI      → cari "TikTok / Instagram Scraper API"
 *
 *  2. HEADLESS BROWSER (puppeteer/playwright):
 *     - Risiko di-banned/IP blocked
 *     - Butuh proxy rotation + captcha solver
 *     - Tidak skalabel
 *
 *  3. UNOFFICIAL LIBRARY:
 *     - instagram-private-api (rawan banned)
 *     - tiktok-scraper (sering rusak)
 *
 *  File ini menyediakan INTERFACE & STUB. Pilih salah satu
 *  pendekatan di atas, lalu ganti implementasi tiap fungsi.
 * ============================================================
 */

const axios = require('axios');

// ───── Deteksi platform dari URL ──────────────────────────
function detectPlatform(url) {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/instagram\.com/.test(url))         return 'instagram';
  if (/tiktok\.com/.test(url))            return 'tiktok';
  if (/threads\.net/.test(url))           return 'threads';
  return null;
}

// ───── Helper: ekstrak ID dari URL ────────────────────────
function extractInstagramId(url) {
  const m = url.match(/instagram\.com\/(?:p|reel|tv)\/([^/?]+)/);
  if (!m) throw new Error('URL Instagram tidak valid');
  return m[1];
}

function extractTikTokId(url) {
  const m = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/) || url.match(/vm\.tiktok\.com\/(\w+)/);
  if (!m) throw new Error('URL TikTok tidak valid');
  return m[1];
}

function extractThreadsId(url) {
  const m = url.match(/threads\.net\/@[^/]+\/post\/([^/?]+)/);
  if (!m) throw new Error('URL Threads tidak valid');
  return m[1];
}

// ───── Stub: Instagram ────────────────────────────────────
async function fetchInstagramData(url) {
  const id = extractInstagramId(url);

  // ⚠️ STUB — ganti dengan integrasi nyata
  // Contoh integrasi dengan Apify:
  //
  // const { data } = await axios.post(
  //   `https://api.apify.com/v2/acts/apify~instagram-comment-scraper/run-sync-get-dataset-items`,
  //   { directUrls: [url], resultsLimit: 500 },
  //   { headers: { Authorization: `Bearer ${process.env.APIFY_TOKEN}` } }
  // );
  // return {
  //   videoId: id,
  //   title: data[0]?.caption || 'Instagram Post',
  //   comments: data.map(c => ({
  //     text: c.text, author: c.ownerUsername, likes: c.likesCount,
  //     publishedAt: c.timestamp,
  //   })),
  // };

  throw new Error(
    'Instagram crawler belum dikonfigurasi. ' +
    'Edit backend/services/crawlerService.js dan integrasikan dengan ' +
    'Apify/Bright Data/RapidAPI. Lihat dokumentasi di file tersebut.'
  );
}

// ───── Stub: TikTok ───────────────────────────────────────
async function fetchTikTokData(url) {
  const id = extractTikTokId(url);

  // ⚠️ STUB — contoh integrasi RapidAPI:
  //
  // const { data } = await axios.get(
  //   'https://tiktok-scraper7.p.rapidapi.com/comment/list',
  //   {
  //     params: { url, count: 500 },
  //     headers: {
  //       'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
  //       'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com',
  //     },
  //   }
  // );

  throw new Error(
    'TikTok crawler belum dikonfigurasi. ' +
    'Integrasikan dengan layanan RapidAPI/Apify di crawlerService.js.'
  );
}

// ───── Stub: Threads ──────────────────────────────────────
async function fetchThreadsData(url) {
  const id = extractThreadsId(url);
  throw new Error(
    'Threads crawler belum dikonfigurasi. ' +
    'Threads API belum dibuka publik untuk komentar pihak ketiga. ' +
    'Gunakan Apify Threads scraper atau alternatif lainnya.'
  );
}

// ───── Router utama ───────────────────────────────────────
async function fetchByPlatform(url) {
  const platform = detectPlatform(url);
  if (!platform) {
    throw new Error('Platform tidak dikenali. Dukungan: YouTube, Instagram, TikTok, Threads');
  }

  switch (platform) {
    case 'youtube':
      return { platform, ...(await require('./youtubeService').fetchYouTubeData(url)) };
    case 'instagram':
      return { platform, ...(await fetchInstagramData(url)) };
    case 'tiktok':
      return { platform, ...(await fetchTikTokData(url)) };
    case 'threads':
      return { platform, ...(await fetchThreadsData(url)) };
  }
}

module.exports = {
  detectPlatform,
  fetchByPlatform,
};
