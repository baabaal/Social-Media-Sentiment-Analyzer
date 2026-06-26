import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHistory } from '../services/api';

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="muted">Memuat riwayat...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl fw-700 mb-3">Riwayat Analisis</h1>

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="muted mb-3">Belum ada analisis yang dilakukan.</p>
          <Link to="/" className="btn">Mulai Analisis Pertama →</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map(item => (
            <Link
              key={item._id}
              to={`/results/${item._id}`}
              className="card"
              style={{
                display: 'flex',
                gap: '1rem',
                transition: 'transform 0.1s, box-shadow 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
            >
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt=""
                  style={{ width: 120, height: 'auto', borderRadius: 6 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-sm muted" style={{ textTransform: 'uppercase' }}>
                  {item.platform}
                </div>
                <div className="fw-600 mb-1" style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {item.title || '(tanpa judul)'}
                </div>
                {item.statistics && (
                  <div className="flex gap-1 text-sm">
                    <span className="badge badge-positive">
                      {item.statistics.positivePercent}% +
                    </span>
                    <span className="badge badge-neutral">
                      {item.statistics.neutralPercent}% =
                    </span>
                    <span className="badge badge-negative">
                      {item.statistics.negativePercent}% −
                    </span>
                  </div>
                )}
                <div className="text-sm muted mt-2">
                  {new Date(item.createdAt).toLocaleString('id-ID')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
