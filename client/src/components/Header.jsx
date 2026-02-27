import { useLocation } from 'react-router-dom';
import './Header.css';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/properties': 'Properties',
  '/owners': 'Owners',
  '/inquiries': 'Inquiries'
};

function Header({ onMenuClick }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Malta Real Estate CRM';

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
          ☰
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="header-right">
        <span className="header-badge">🇲🇹 Malta</span>
      </div>
    </header>
  );
}

export default Header;
