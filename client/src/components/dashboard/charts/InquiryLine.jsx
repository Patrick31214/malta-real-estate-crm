import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { E_MID, GOLD, TOOLTIP_STYLE } from '../constants';

export function InquiryLine({ trendData }) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <LineChart data={trendData} margin={{ top: 4, right: 16, bottom: 4, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(64,145,108,0.1)" />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8aab99' }} />
        <YAxis tick={{ fontSize: 11, fill: '#8aab99' }} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE}
          formatter={v => [`${v} inquiries`, 'Count']} />
        <Line type="monotone" dataKey="inquiries" stroke={E_MID}
          strokeWidth={2.5} dot={{ r: 4, fill: GOLD, stroke: E_MID }}
          activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
