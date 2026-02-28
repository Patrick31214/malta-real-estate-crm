import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle, Handshake, Users, Calculator } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { properties, owners, activityLogs } from '../services/api';
import './DashboardPage.css';

const STATUS_COLORS = {
  available: '#1DB954',
  under_offer: '#D4AF37',
  sold: '#c0392b',
  rented: '#2980b9',
};

function StatCard({ icon: Icon, label, value, color, linkTo }) {
  return (
    <Link to={linkTo} className="stat-card" style={{ '--card-color': color }}>
      <div className="stat-icon"><Icon size={26} strokeWidth={1.75} /></div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-arrow">→</div>
    </Link>
  );
}

function StatusPieChart({ stats }) {
  const data = [
    { name: 'Available', value: stats.available, color: STATUS_COLORS.available },
    { name: 'Under Offer', value: stats.underOffer, color: STATUS_COLORS.under_offer },
    { name: 'Sold', value: stats.sold, color: STATUS_COLORS.sold },
    { name: 'Rented', value: stats.rented, color: STATUS_COLORS.rented },
  ].filter(d => d.value > 0);

  if (data.length === 0) return <div className="chart-empty">No data yet</div>;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value, name]}
          contentStyle={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: 8,
            color: 'var(--text-primary)',
            fontSize: 12,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function PriceTypeChart({ properties: props }) {
  if (!props || props.length === 0) return <div className="chart-empty">No data yet</div>;

  const typeMap = {};
  props.forEach(p => {
    const type = p.propertyType || 'other';
    if (!typeMap[type]) typeMap[type] = { type, count: 0, totalPrice: 0 };
    typeMap[type].count++;
    typeMap[type].totalPrice += Number(p.price) || 0;
  });

  const data = Object.values(typeMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map(d => ({
      type: d.type.charAt(0).toUpperCase() + d.type.slice(1),
      count: d.count,
      avgPrice: Math.round(d.totalPrice / d.count / 1000),
    }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="type" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: 8,
            color: 'var(--text-primary)',
            fontSize: 12,
          }}
          formatter={(value, name) => [name === 'count' ? `${value} properties` : `€${value}k avg`, name === 'count' ? 'Count' : 'Avg Price']}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="count" fill="#D4AF37" name="Count" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalOwners: 0,
    available: 0,
    sold: 0,
    rented: 0,
    underOffer: 0
  });
  const [allProperties, setAllProperties] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [propsRes, ownersRes, activityRes] = await Promise.all([
          properties.getAll({ limit: 100 }),
          owners.getAll({ limit: 1 }),
          activityLogs.getAll({ limit: 10 }).catch(() => ({ success: false }))
        ]);

        if (propsRes.success) {
          const props = propsRes.data.properties;
          const total = propsRes.data.pagination.total;
          setStats({
            totalProperties: total,
            totalOwners: ownersRes.success ? ownersRes.data.pagination.total : 0,
            available: props.filter(p => p.status === 'available').length,
            sold: props.filter(p => p.status === 'sold').length,
            rented: props.filter(p => p.status === 'rented').length,
            underOffer: props.filter(p => p.status === 'under_offer').length
          });
          setAllProperties(props);
        }

        if (activityRes.success) {
          setActivityFeed(activityRes.data?.logs || activityRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div className="spinner" />;
  }

  const isEmpty = stats.totalProperties === 0 && stats.totalOwners === 0;

  return (
    <div className="dashboard">
      {/* Stats grid */}
      <div className="stats-grid">
        <StatCard icon={Building2} label="Total Properties" value={stats.totalProperties} color="#1e3a5f" linkTo="/properties" />
        <StatCard icon={CheckCircle} label="Available" value={stats.available} color="var(--emerald-primary, #2D6A4F)" linkTo="/properties?status=available" />
        <StatCard icon={Handshake} label="Under Offer" value={stats.underOffer} color="#e8a020" linkTo="/properties?status=under_offer" />
        <StatCard icon={Users} label="Owners" value={stats.totalOwners} color="#8e44ad" linkTo="/owners" />
      </div>

      {isEmpty ? (
        <div className="dashboard-welcome card">
          <div className="welcome-icon"><Building2 size={48} strokeWidth={1.25} style={{color:'var(--gold-primary)'}} /></div>
          <h2>Welcome to Golden Key Realty CRM</h2>
          <p>
            Your premium CRM is up and running. Start by adding your first property owner and listing.
          </p>
          <div className="welcome-actions">
            <Link to="/owners" className="btn btn-primary btn-lg">
              + Add Owner
            </Link>
            <Link to="/properties" className="btn btn-outline btn-lg">
              View Properties
            </Link>
            <Link to="/mortgage-calculator" className="btn btn-outline btn-lg">
              <Calculator size={18} strokeWidth={1.75} /> Mortgage Calculator
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="dashboard-grid">
            {/* Pie chart */}
            <div className="card quick-stats">
              <h3>Property Status Mix</h3>
              <StatusPieChart stats={stats} />
              <div className="pie-legend">
                {[
                  { label: 'Available', color: STATUS_COLORS.available },
                  { label: 'Under Offer', color: STATUS_COLORS.under_offer },
                  { label: 'Sold', color: STATUS_COLORS.sold },
                  { label: 'Rented', color: STATUS_COLORS.rented },
                ].map(l => (
                  <span key={l.label} className="pie-legend-item">
                    <span className="pie-legend-dot" style={{ background: l.color }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bar chart */}
          {allProperties.length > 0 && (
            <div className="card" style={{ marginTop: 24 }}>
              <div className="section-header" style={{ marginBottom: 12 }}>
                <h3>Properties by Type</h3>
              </div>
              <PriceTypeChart properties={allProperties} />
            </div>
          )}

          {/* Activity feed */}
          {activityFeed.length > 0 && (
            <div className="card" style={{ marginTop: 24 }}>
              <div className="section-header" style={{ marginBottom: 16 }}>
                <h3>Recent Activity</h3>
                <Link to="/activity-log" className="btn btn-outline btn-sm">View all</Link>
              </div>
              <div className="activity-feed">
                {activityFeed.map((log, i) => (
                  <div key={log.id || i} className="activity-item">
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <span className="activity-action">{log.action || log.type || 'Action'}</span>
                      {log.description && <span className="activity-desc"> — {log.description}</span>}
                      <div className="activity-meta">
                        {log.user && <span>{log.user.firstName || log.user.email}</span>}
                        {log.createdAt && <span>{new Date(log.createdAt).toLocaleString()}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DashboardPage;

