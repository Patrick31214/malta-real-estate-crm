import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GOLD, TOOLTIP_STYLE } from '../constants';

export function DealsBar({ propList }) {
  if (!propList.length) return <div className="chart-empty">No data yet</div>;
  const sales     = propList.filter(p => p.status === 'sold').length;
  const longLets  = propList.filter(p => p.status === 'rented' && p.rentalType !== 'short').length;
  const shortLets = propList.filter(p => p.status === 'rented' && p.rentalType === 'short').length;
  const data = [
    { type: 'Sales',     count: sales     },
    { type: 'Long Let',  count: longLets  },
    { type: 'Short Let', count: shortLets },
  ];
  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(184,134,78,0.1)" />
        <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#c4a882' }} />
        <YAxis tick={{ fontSize: 11, fill: '#c4a882' }} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v} deals`, 'Count']} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          <Cell fill="#c0392b" />
          <Cell fill="#2980b9" />
          <Cell fill={GOLD} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
