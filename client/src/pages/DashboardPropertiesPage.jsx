import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { properties } from '../services/api';

const COLORS = ['#8A5A32', '#B8864E', '#C4875A', '#c0392b', '#6B5040', '#7A5C3A'];
const STATUS_COLORS = {
  available: '#B8864E',
  under_offer: '#C4875A',
  sold: '#c0392b',
  rented: '#6B5040',
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

function DashboardPropertiesPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    properties.getAll({ limit: 200 }).then(res => {
      if (res?.success) {
        setData(res.data.properties || []);
        setTotal(res.data.pagination?.total || 0);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>;

  const counts = {
    available: data.filter(p => p.status === 'available').length,
    under_offer: data.filter(p => p.status === 'under_offer').length,
    sold: data.filter(p => p.status === 'sold').length,
    rented: data.filter(p => p.status === 'rented').length,
  };

  // By type
  const typeMap = {};
  data.forEach(p => {
    const t = p.propertyType || 'other';
    typeMap[t] = (typeMap[t] || 0) + 1;
  });
  const byTypeData = Object.entries(typeMap).map(([type, count]) => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count,
  })).sort((a, b) => b.count - a.count);

  // By status (pie)
  const byStatusData = Object.entries(counts).map(([status, value]) => ({
    name: status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value,
    color: STATUS_COLORS[status],
  })).filter(d => d.value > 0);

  // Listings over time (simulate 30 days by bucketing createdAt)
  const now = Date.now();
  const dayMs = 86400000;
  const daysMap = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * dayMs);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    daysMap[key] = 0;
  }
  data.forEach(p => {
    if (p.createdAt) {
      const d = new Date(p.createdAt);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      if (key in daysMap) daysMap[key]++;
    }
  });
  const lineData = Object.entries(daysMap).map(([date, count]) => ({ date, count }));

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
          <Building2 size={24} /> Properties Overview
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatBox label="Total" value={total} color="#8A5A32" />
        <StatBox label="Available" value={counts.available} color="#B8864E" />
        <StatBox label="Under Offer" value={counts.under_offer} color="#C4875A" />
        <StatBox label="Sold" value={counts.sold} color="#c0392b" />
        <StatBox label="Rented" value={counts.rented} color="#6B5040" />
      </div>

      {/* Line chart */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 16 }}>Listings Over Time (last 30 days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={4} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="count" stroke="#B8864E" strokeWidth={2} dot={false} name="New Listings" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar + Pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 16 }}>By Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byTypeData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="type" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Properties" radius={[4, 4, 0, 0]}>
                {byTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 16 }}>By Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {byStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 16px', color: 'var(--text-primary)', fontSize: 16 }}>Recent Properties</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {['Title', 'Type', 'Status', 'Price', 'City'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>{p.title || '—'}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{p.propertyType || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                      background: `${STATUS_COLORS[p.status] || '#555'}22`,
                      color: STATUS_COLORS[p.status] || 'var(--text-muted)',
                    }}>{p.status || '—'}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>
                    {p.price ? `€${Number(p.price).toLocaleString()}` : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{p.city || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPropertiesPage;
