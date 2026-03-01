import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { STATUS_COLORS, TOOLTIP_STYLE } from '../constants';

export function StatusDonut({ propList }) {
  const counts = {};
  propList.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
  const data = Object.entries(counts)
    .map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || '#888' }))
    .filter(d => d.value > 0);

  if (data.length === 0) return <div className="chart-empty">No data yet</div>;

  return (
    <div className="chart-with-legend">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={82}
            paddingAngle={3} dataKey="value">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE}
            formatter={(v, n) => [v, n.replace(/_/g, ' ')]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pie-legend">
        {data.map(d => (
          <span key={d.name} className="pie-legend-item">
            <span className="pie-legend-dot" style={{ background: d.color }} />
            {d.name.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}
