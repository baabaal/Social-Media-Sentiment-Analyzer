/**
 * ============================================================
 *  MODEL: Analysis
 * ============================================================
 *  Schema untuk menyimpan satu sesi analisis sentimen.
 *  Setiap dokumen merepresentasikan analisis satu video/post.
 * ============================================================
 */

const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, default: 'anonymous' },
  likes: { type: Number, default: 0 },
  publishedAt: { type: Date },

  // Hasil analisis sentimen
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    required: true,
  },
  score: { type: Number, default: 0 },          // skor numerik
  comparative: { type: Number, default: 0 },    // skor / jumlah token
}, { _id: false });

const StatisticsSchema = new mongoose.Schema({
  totalComments: Number,
  totalLikes: Number,
  avgLikes: Number,
  avgScore: Number,         // rata-rata skor sentimen
  medianScore: Number,
  stdDevScore: Number,
  positiveCount: Number,
  neutralCount: Number,
  negativeCount: Number,
  positivePercent: Number,
  neutralPercent: Number,
  negativePercent: Number,
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['youtube', 'instagram', 'tiktok', 'threads'],
    required: true,
  },
  url: { type: String, required: true },
  videoId: { type: String, required: true },
  title: { type: String },
  thumbnail: { type: String },
  channelName: { type: String },

  comments: [CommentSchema],
  statistics: StatisticsSchema,

  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  errorMessage: String,
}, {
  timestamps: true,        // createdAt & updatedAt otomatis
});

// Index untuk query lebih cepat
AnalysisSchema.index({ createdAt: -1 });
AnalysisSchema.index({ videoId: 1, platform: 1 });

module.exports = mongoose.model('Analysis', AnalysisSchema);
