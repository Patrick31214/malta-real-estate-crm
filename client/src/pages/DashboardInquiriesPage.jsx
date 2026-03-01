import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { inquiries } from '../services/api';

const COLORS = ['#2D6A4F', '#40916C', '#D4AF37', '#c0392b', '#2980b9'];
const STATUS_COLORS = {
  new: '#40916C',
  in_progress: '#D4AF37',
  resolved: '#2980b9',
  closed: '#888',
};

const tooltipStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--glass-border)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontSize: 12,
};

function StatBox({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      textAlign: 'center',
      borderTop: `3px solid ${color || 'var(--emerald-primary)'}`,
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || 'var(--emerald-primary)' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function DashboardInquiriesPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inquiries.getAll({ limit: 200 }).then(res => {
      if (res?.success) {
        setData(res.data.inquiries || []);
        setTotal(res.data.pagination?.total || 0);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>;

  const counts = {
    new: data.filter(i => i.status === 'new').length,
    in_progress: data.filter(i => i.status === 'in_progress').length,
    resolved: data.filter(i => i.status === 'resolved').length,
    closed: data.filter(i => i.status === 'closed').length,
  };

  const byStatusData = Object.entries(counts).map(([status, value]) => ({
    status: status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value,
    color: STATUS_COLORS[status],
  }));

  const sourceMap = {};
  data.forEach(i => {
    const src = i.source || 'unknown';
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const bySourceData = Object.entries(sourceMap).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const recent = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

  const cardStyle = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius)',
    padding: 24,
    marginBottom: 24,
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/dashboard" style={{ color: 'var(--emerald-primary)', textDecoration: 'none', fontSize: 14 }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ margin: 0, fontSize: 24, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageSquare size={24} /> Inquiries Overview
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatBox label="Total" value={total} color="#2D6A4F" />
        <StatBox label="New" value={counts.new} color="#40916C" />
        <StatBox label="In Progress" value={counts.in_progress} color="#D4AF37" />
        <StatBox label="Resolved" value={counts.resolved} color="#2980b9" />
        <StatBox label="Closed" value={counts.closed} color="#888" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 16 }}>Inquiries by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byStatusData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" name="Inquiries" radius={[4, 4, 0, 0]}>
                {byStatusData.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 16 }}>Inquiry Sources</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={bySourceData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                {bySourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 16 }}>Recent Inquiries</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {['Client', 'Status', 'Message', 'Date'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(inq => (
                <tr key={inq.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>{inq.clientName || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                      background: `${STATUS_COLORS[inq.status] || '#555'}22`,
                      color: STATUS_COLORS[inq.status] || 'var(--text-muted)',
                    }}>{inq.status || '—'}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', maxWidth: 300 }}>
                    {inq.message ? inq.message.slice(0, 80) + (inq.message.length > 80 ? '…' : '') : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardInquiriesPage;
