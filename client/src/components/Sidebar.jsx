import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/properties', label: 'Properties', icon: '🏠' },
  { to: '/owners', label: 'Owners', icon: '👤' },
  { to: '/agents', label: 'Agents', icon: '👔' },
  { to: '/inquiries', label: 'Inquiries', icon: '📋' }
];

const adminNavItems = [
  { to: '/activity-log', label: 'Activity Log', icon: '🔍' }
];

function Sidebar({ onClose }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.logout();
    navigate('/login');
  };

  const user = auth.getUser();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🗝️</div>
        <div className="logo-text">
          <span className="logo-title">Golden Key Realty</span>
          <span className="logo-subtitle">Premium Real Estate CRM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="nav-section-title">Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}

        {user && (user.role === 'admin' || user.role === 'manager') && (
          <>
            <p className="nav-section-title" style={{ marginTop: 16 }}>Admin</p>
            {adminNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </>
        )}

        <p className="nav-section-title" style={{ marginTop: 16 }}>Website</p>
        <a
          href="/listings"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-item"
          onClick={onClose}
        >
          <span className="nav-icon">🌐</span>
          <span className="nav-label">Public Listings</span>
        </a>
      </nav>

      {/* Bottom user info */}
      <div className="sidebar-footer">
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {(user.firstName || user.email || '?')[0].toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">
                {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}
              </span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
