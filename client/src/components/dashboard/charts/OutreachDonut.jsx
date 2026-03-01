import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { E_MID, GOLD, TOOLTIP_STYLE } from '../constants';

export function OutreachDonut({ agentViews, aiContacts }) {
  const agentTotal = agentViews || 0;
  const aiTotal    = aiContacts || 0;
  if (agentTotal === 0 && aiTotal === 0) return <div className="chart-empty">No data yet</div>;
  const data = [
    { name: 'Agent Outreach', value: agentTotal, color: E_MID },
    { name: 'AI Automated',   value: aiTotal,    color: GOLD  },
  ].filter(d => d.value > 0);
  return (
    <div className="chart-with-legend">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={46} outerRadius={74}
            paddingAngle={3} dataKey="value">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pie-legend">
        {data.map(d => (
          <span key={d.name} className="pie-legend-item">
            <span className="pie-legend-dot" style={{ background: d.color }} />
            {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}
