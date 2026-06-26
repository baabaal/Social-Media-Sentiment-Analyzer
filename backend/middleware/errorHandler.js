/**
 * ============================================================
 *  MIDDLEWARE: Global error handler
 * ============================================================
 *  Tangkap semua error yang di-`throw` di controller/service
 *  dan kirim respons JSON yang konsisten ke client.
 * ============================================================
 */

module.exports = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Data tidak valid', details: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Format ID tidak valid' });
  }

  // Axios (gagal panggil YouTube API dsb)
  if (err.response) {
    return res.status(err.response.status || 500).json({
      error: 'Gagal memanggil API eksternal',
      details: err.response.data?.error?.message || err.message,
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Terjadi kesalahan server',
  });
};
