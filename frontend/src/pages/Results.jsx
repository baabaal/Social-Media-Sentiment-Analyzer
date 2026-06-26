import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysis, getDownloadUrl } from '../services/api';
import SentimentChart from '../components/SentimentChart.jsx';
import TopComments from '../components/TopComments.jsx';
import Statistics from '../components/Statistics.jsx';

export default function Results() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getAnalysis(id)
      .then(d => { if (mounted) setData(d); })
      .catch(err => {
        if (mounted) setError(err.response?.data?.error || err.message);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div className="spinner" style={{ borderTopColor: 'var(--accent)', borderColor: 'var(--border)' }} />
        <p className="muted mt-2">Memuat hasil analisis...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card">
        <h2>⚠ Gagal Memuat</h2>
        <p className="muted mb-3">{error || 'Data tidak ditemukan'}</p>
        <Link to="/" className="btn">← Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">

      {/* ───── Header video info ─────────────────────────── */}
      <div className="card">
        <div className="flex gap-2" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {data.thumbnail && (
            <img
              src={data.thumbnail}
              alt={data.title}
              style={{
                width: 180, height: 'auto',
                borderRadius: 8,
                objectFit: 'cover',
              }}
            />
          )}
          <div style={{ flex: '1 1 300px' }}>
            <div className="text-sm muted mb-1" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {data.platform}
            </div>
            <h1 className="text-xl fw-700 mb-1">{data.title || 'Tanpa Judul'}</h1>
            {data.channelName && (
              <p className="muted mb-2">{data.channelName}</p>
            )}
            <div className="flex gap-1 flex-wrap mt-2">
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary text-sm"
              >
                Lihat Aslinya ↗
              </a>
              <a
                href={getDownloadUrl(id, 'csv')}
                className="btn btn-secondary text-sm"
                download
              >
                ⬇ Download CSV
              </a>
              <a
                href={getDownloadUrl(id, 'json')}
                className="btn btn-secondary text-sm"
                download
              >
                ⬇ Download JSON
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Sentiment chart ───────────────────────────── */}
      <div className="card">
        <h2 className="text-lg fw-600 mb-3">Distribusi Sentimen</h2>
        <SentimentChart statistics={data.statistics} />
      </div>

      {/* ───── Statistics ────────────────────────────────── */}
      <div className="card">
        <h2 className="text-lg fw-600 mb-3">Statistik Deskriptif</h2>
        <Statistics stats={data.statistics} />
      </div>

      {/* ───── Top 10 Comments ───────────────────────────── */}
      <div className="card">
        <h2 className="text-lg fw-600 mb-3">Top 10 Komentar Terpopuler</h2>
        <TopComments comments={data.topComments} />
      </div>
    </div>
  );
}
