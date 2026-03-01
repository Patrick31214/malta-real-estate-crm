import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GOLD, TOOLTIP_STYLE } from '../constants';

export function TypeBar({ propList }) {
  if (!propList.length) return <div className="chart-empty">No data yet</div>;
  const map = {};
  propList.forEach(p => {
    const t = p.propertyType || 'other';
    map[t] = (map[t] || 0) + 1;
  });
  const data = Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '),
      count,
    }));

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(184,134,78,0.1)" />
        <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#c4a882' }} />
        <YAxis tick={{ fontSize: 11, fill: '#c4a882' }} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE}
          formatter={v => [`${v} properties`, 'Count']} />
        <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} name="Properties" />
      </BarChart>
    </ResponsiveContainer>
  );
}
