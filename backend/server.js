/**
 * ============================================================
 *  SENTIMENT ANALYZER — BACKEND ENTRY POINT
 * ============================================================
 *  Bertanggung jawab untuk:
 *  1. Setup express + middleware (cors, json parser)
 *  2. Koneksi ke MongoDB via mongoose
 *  3. Mount route /api/*
 *  4. Error handler global
 * ============================================================
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const analysisRoutes = require('./routes/analysis');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ───── Middleware ─────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check — berguna untuk monitoring/uptime check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ───── API routes ─────────────────────────────────────────
app.use('/api', analysisRoutes);

// 404 untuk route yang tidak match
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Error handler harus diletakkan paling akhir
app.use(errorHandler);

// ───── Connect MongoDB lalu jalankan server ───────────────
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // opsi modern mongoose tidak butuh useNewUrlParser dll
    });
    console.log('✅ MongoDB terhubung:', mongoose.connection.host);

    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Gagal start server:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown — penting untuk PM2 & Docker
process.on('SIGTERM', async () => {
  console.log('SIGTERM diterima, menutup koneksi...');
  await mongoose.connection.close();
  process.exit(0);
});

start();
