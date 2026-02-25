import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { properties, owners } from '../services/api';
import './DashboardPage.css';

function StatCard({ icon, label, value, color, linkTo }) {
  return (
    <Link to={linkTo} className="stat-card" style={{ '--card-color': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-arrow">→</div>
    </Link>
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
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [propsRes, ownersRes] = await Promise.all([
          properties.getAll({ limit: 100 }),
          owners.getAll({ limit: 1 })
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
          setRecentProperties(props.slice(0, 5));
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
        <StatCard icon="🏠" label="Total Properties" value={stats.totalProperties} color="#1e3a5f" linkTo="/properties" />
        <StatCard icon="✅" label="Available" value={stats.available} color="#27ae60" linkTo="/properties?status=available" />
        <StatCard icon="🤝" label="Under Offer" value={stats.underOffer} color="#e8a020" linkTo="/properties?status=under_offer" />
        <StatCard icon="👤" label="Owners" value={stats.totalOwners} color="#8e44ad" linkTo="/owners" />
      </div>

      {isEmpty ? (
        <div className="dashboard-welcome card">
          <div className="welcome-icon">🏖️</div>
          <h2>Welcome to Malta Real Estate CRM</h2>
          <p>
            Your CRM is up and running. Start by adding your first property owner and listing.
          </p>
          <div className="welcome-actions">
            <Link to="/owners" className="btn btn-primary btn-lg">
              + Add Owner
            </Link>
            <Link to="/properties" className="btn btn-outline btn-lg">
              View Properties
            </Link>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Recent Properties */}
          <div className="card recent-section">
            <div className="section-header">
              <h3>Recent Properties</h3>
              <Link to="/properties" className="btn btn-outline btn-sm">View all</Link>
            </div>
            {recentProperties.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏠</div>
                <p>No properties yet</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProperties.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.title}</strong><br /><small style={{color:'var(--text-light)'}}>{p.city}</small></td>
                        <td style={{textTransform:'capitalize'}}>{p.propertyType}</td>
                        <td>€{Number(p.price).toLocaleString()}</td>
                        <td><span className={`badge badge-${p.status}`}>{p.status.replace('_', ' ')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="card quick-stats">
            <h3>Property Status Breakdown</h3>
            <div className="status-breakdown">
              {[
                { label: 'Available', value: stats.available, color: 'var(--success)', percent: stats.totalProperties ? (stats.available / stats.totalProperties * 100) : 0 },
                { label: 'Under Offer', value: stats.underOffer, color: 'var(--accent)', percent: stats.totalProperties ? (stats.underOffer / stats.totalProperties * 100) : 0 },
                { label: 'Sold', value: stats.sold, color: 'var(--danger)', percent: stats.totalProperties ? (stats.sold / stats.totalProperties * 100) : 0 },
                { label: 'Rented', value: stats.rented, color: 'var(--info)', percent: stats.totalProperties ? (stats.rented / stats.totalProperties * 100) : 0 }
              ].map(s => (
                <div key={s.label} className="status-item">
                  <div className="status-row">
                    <span className="status-name">{s.label}</span>
                    <span className="status-count">{s.value}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${s.percent}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
