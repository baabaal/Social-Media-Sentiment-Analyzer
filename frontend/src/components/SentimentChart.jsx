import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = {
  positive: '#10b981',
  neutral:  '#9ca3af',
  negative: '#ef4444',
};

export default function SentimentChart({ statistics }) {
  if (!statistics) return <p className="muted">Tidak ada data statistik.</p>;

  const data = [
    { name: 'Positif',  value: statistics.positiveCount, percent: statistics.positivePercent, color: COLORS.positive },
    { name: 'Netral',   value: statistics.neutralCount,  percent: statistics.neutralPercent,  color: COLORS.neutral  },
    { name: 'Negatif',  value: statistics.negativeCount, percent: statistics.negativePercent, color: COLORS.negative },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
    }}>

      {/* ───── Pie chart ─────────────────────────────────── */}
      <div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={100}
              paddingAngle={2}
              label={({ percent }) => `${percent}%`}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} komentar`, name]}
              contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ───── Bar chart ─────────────────────────────────── */}
      <div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v) => [`${v} komentar`, 'Jumlah']}
              contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ───── Summary cards ─────────────────────────────── */}
      <div style={{ gridColumn: '1 / -1', display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {data.map(d => (
          <div key={d.name} style={{
            padding: '1rem',
            borderRadius: 8,
            background: `${d.color}10`,
            borderLeft: `4px solid ${d.color}`,
          }}>
            <div className="text-sm muted">{d.name}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: d.color }}>
              {d.percent}%
            </div>
            <div className="text-sm muted">{d.value} komentar</div>
          </div>
        ))}
      </div>
    </div>
  );
}
