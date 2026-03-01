import { Link } from 'react-router-dom';
import { E_DARK } from './constants';

export function StatCard({ icon: Icon, label, value, linkTo, accent, sub }) {
  return (
    <Link to={linkTo} className="dash-stat-card" style={{ '--accent': accent || E_DARK }}>
      <div className="dash-stat-icon">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <div className="dash-stat-body">
        <span className="dash-stat-value">{value ?? '—'}</span>
        <span className="dash-stat-label">{label}</span>
        {sub && <span className="dash-stat-sub">{sub}</span>}
      </div>
      <span className="dash-stat-arrow">›</span>
    </Link>
  );
}
