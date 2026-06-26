import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeUrl } from '../services/api';

const PLATFORMS = [
  { name: 'YouTube',   icon: '▶',  color: '#ff0000', supported: true  },
  { name: 'Instagram', icon: '◉',  color: '#e1306c', supported: false },
  { name: 'TikTok',    icon: '♪',  color: '#000000', supported: false },
  { name: 'Threads',   icon: '@',  color: '#000000', supported: false },
];

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Mohon masukkan URL video');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeUrl(url.trim());
      navigate(`/results/${result.id}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Gagal menganalisis URL';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home">
      {/* Hero */}
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginBottom: '1rem',
        }}>
          Analisis Sentimen<br />
          <span style={{ color: 'var(--accent)' }}>Komentar Media Sosial</span>
        </h1>
        <p className="muted" style={{ fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>
          Masukkan URL video YouTube, Instagram, TikTok, atau Threads.
          Sistem akan menghimpun komentar dan menganalisis sentimennya secara otomatis.
        </p>
      </section>

      {/* Form */}
      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label htmlFor="url" className="fw-600">URL Video</label>
          <input
            id="url"
            type="url"
            className="input"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            disabled={loading}
            required
          />

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: 8,
              fontSize: '0.9rem',
            }}>
              ⚠ {error}
            </div>
          )}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Menganalisis... (mungkin 1-2 menit)
              </>
            ) : (
              'Mulai Analisis →'
            )}
          </button>
        </form>
      </div>

      {/* Supported platforms */}
      <section style={{ marginTop: '4rem' }}>
        <h2 className="text-lg fw-600 mb-3" style={{ textAlign: 'center' }}>
          Platform yang Didukung
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          maxWidth: 800,
          margin: '0 auto',
        }}>
          {PLATFORMS.map(p => (
            <div key={p.name} className="card" style={{
              textAlign: 'center',
              opacity: p.supported ? 1 : 0.5,
            }}>
              <div style={{ fontSize: '2rem', color: p.color, marginBottom: '0.5rem' }}>
                {p.icon}
              </div>
              <div className="fw-600">{p.name}</div>
              <div className="text-sm muted" style={{ marginTop: '0.25rem' }}>
                {p.supported ? '✓ Tersedia' : 'Butuh konfigurasi tambahan'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ marginTop: '4rem' }}>
        <h2 className="text-lg fw-600 mb-3" style={{ textAlign: 'center' }}>Fitur</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}>
          {[
            { icon: '📊', title: 'Analisis Sentimen', desc: 'Klasifikasi positif/netral/negatif' },
            { icon: '🏆', title: 'Top 10 Komentar', desc: 'Komentar terpopuler berdasarkan likes' },
            { icon: '📈', title: 'Statistik Deskriptif', desc: 'Mean, median, standar deviasi' },
            { icon: '💾', title: 'Export Data', desc: 'Download dalam format CSV atau JSON' },
          ].map(f => (
            <div key={f.title} className="card">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <div className="fw-600 mb-1">{f.title}</div>
              <div className="text-sm muted">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
