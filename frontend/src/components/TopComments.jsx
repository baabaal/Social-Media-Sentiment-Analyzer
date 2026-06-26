/**
 * Tampilkan daftar top 10 komentar.
 * Sudah di-sort oleh backend by likes (descending).
 */

export default function TopComments({ comments = [] }) {
  if (!comments.length) {
    return <p className="muted">Tidak ada komentar untuk ditampilkan.</p>;
  }

  return (
    <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {comments.map((c, i) => (
        <li key={i} style={{
          padding: '1rem',
          borderRadius: 8,
          background: '#f9fafb',
          border: '1px solid var(--border)',
          display: 'flex',
          gap: '1rem',
        }}>
          {/* Ranking number */}
          <div style={{
            flexShrink: 0,
            width: 32, height: 32,
            borderRadius: '50%',
            background: i < 3 ? 'var(--accent)' : '#e5e7eb',
            color: i < 3 ? 'white' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}>
            {i + 1}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Header: author + sentiment badge */}
            <div className="flex gap-1 items-center mb-1" style={{ flexWrap: 'wrap' }}>
              <strong className="text-sm">{c.author || 'Anonim'}</strong>
              <span className={`badge badge-${c.sentiment}`}>
                {c.sentiment === 'positive' && 'positif'}
                {c.sentiment === 'neutral' && 'netral'}
                {c.sentiment === 'negative' && 'negatif'}
              </span>
              <span className="text-sm muted">
                ♥ {(c.likes || 0).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Comment text */}
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {c.text}
            </p>

            {/* Footer: score & date */}
            <div className="text-sm muted" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
              Skor: {c.score?.toFixed(2)} | Comparative: {c.comparative?.toFixed(3)}
              {c.publishedAt && ` • ${new Date(c.publishedAt).toLocaleDateString('id-ID')}`}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
