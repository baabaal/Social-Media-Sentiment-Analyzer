/**
 * Tampilan statistik deskriptif:
 *  - Total komentar
 *  - Total/rata-rata likes
 *  - Mean, median, std dev skor sentimen
 */

export default function Statistics({ stats }) {
  if (!stats) return <p className="muted">Tidak ada statistik tersedia.</p>;

  const cards = [
    { label: 'Total Komentar', value: stats.totalComments?.toLocaleString('id-ID') },
    { label: 'Total Likes',    value: stats.totalLikes?.toLocaleString('id-ID') },
    { label: 'Rata-rata Likes', value: stats.avgLikes?.toFixed(2) },
    { label: 'Mean Skor',      value: stats.avgScore?.toFixed(3), help: 'Rata-rata skor sentimen (negatif < 0 < positif)' },
    { label: 'Median Skor',    value: stats.medianScore?.toFixed(3), help: 'Nilai tengah distribusi skor' },
    { label: 'Std Deviasi',    value: stats.stdDevScore?.toFixed(3), help: 'Variabilitas skor — semakin tinggi, semakin beragam opini' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '1rem',
    }}>
      {cards.map(c => (
        <div key={c.label} style={{
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: 8,
          border: '1px solid var(--border)',
        }}>
          <div className="text-sm muted mb-1">{c.label}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            {c.value ?? '–'}
          </div>
          {c.help && (
            <div className="text-sm muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {c.help}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
