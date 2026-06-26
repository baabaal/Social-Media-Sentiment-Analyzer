/**
 * ============================================================
 *  CONTROLLER: Analysis
 * ============================================================
 *  Alur untuk satu request analisis:
 *  1. Buat dokumen status 'processing' di DB
 *  2. Crawl komentar dari platform yang sesuai
 *  3. Jalankan sentiment analysis & hitung statistik
 *  4. Simpan hasil → status 'completed'
 *  5. Return data ke client
 * ============================================================
 */

const Analysis = require('../models/Analysis');
const { fetchByPlatform } = require('../services/crawlerService');
const { analyzeBatch } = require('../services/sentimentService');
const { Parser } = require('json2csv');

/**
 * POST /api/analyze
 * Body: { url: string }
 */
exports.createAnalysis = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL harus disertakan' });
    }

    // 1. Buat record pending
    const analysis = await Analysis.create({
      url,
      platform: 'youtube',          // sementara default, diupdate setelah crawl
      videoId: 'pending',
      status: 'processing',
    });

    try {
      // 2. Crawl komentar
      const crawled = await fetchByPlatform(url);

      // 3. Sentiment analysis
      const { comments: analyzed, statistics } = analyzeBatch(crawled.comments);

      // 4. Update record
      analysis.platform = crawled.platform;
      analysis.videoId = crawled.videoId;
      analysis.title = crawled.title;
      analysis.thumbnail = crawled.thumbnail;
      analysis.channelName = crawled.channelName;
      analysis.comments = analyzed;
      analysis.statistics = statistics;
      analysis.status = 'completed';
      await analysis.save();

      // 5. Return — ringkas saja, full data via endpoint /api/analysis/:id
      return res.status(201).json({
        id: analysis._id,
        platform: analysis.platform,
        title: analysis.title,
        status: 'completed',
        statistics: analysis.statistics,
      });
    } catch (crawlErr) {
      analysis.status = 'failed';
      analysis.errorMessage = crawlErr.message;
      await analysis.save();
      throw crawlErr;
    }
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analysis/:id
 */
exports.getAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ error: 'Analisis tidak ditemukan' });

    // Sort top 10 komentar by likes
    const topComments = [...(analysis.comments || [])]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 10);

    res.json({
      id: analysis._id,
      url: analysis.url,
      platform: analysis.platform,
      videoId: analysis.videoId,
      title: analysis.title,
      thumbnail: analysis.thumbnail,
      channelName: analysis.channelName,
      statistics: analysis.statistics,
      topComments,
      totalCommentsAnalyzed: analysis.comments?.length || 0,
      createdAt: analysis.createdAt,
      status: analysis.status,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analysis/:id/download?format=csv|json
 */
exports.downloadAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ error: 'Analisis tidak ditemukan' });

    const format = (req.query.format || 'csv').toLowerCase();
    const filename = `sentiment-${analysis.videoId}-${Date.now()}`;

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.json({
        meta: {
          platform: analysis.platform,
          url: analysis.url,
          title: analysis.title,
          statistics: analysis.statistics,
        },
        comments: analysis.comments,
      });
    }

    // CSV
    const fields = ['author', 'text', 'likes', 'publishedAt', 'sentiment', 'score', 'comparative'];
    const parser = new Parser({ fields });
    const csv = parser.parse(analysis.comments);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.send('\uFEFF' + csv);     // BOM untuk Excel agar Unicode benar
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/history
 * Daftar 20 analisis terbaru
 */
exports.getHistory = async (req, res, next) => {
  try {
    const list = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('platform url title thumbnail statistics status createdAt');
    res.json(list);
  } catch (err) {
    next(err);
  }
};
