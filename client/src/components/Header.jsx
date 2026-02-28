import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './Header.css';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/properties': 'Properties',
  '/owners': 'Owners',
  '/inquiries': 'Inquiries',
  '/agents': 'Agents',
  '/activity-log': 'Activity Log'
};

function Header({ onMenuClick }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Golden Key Realty';
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
          ☰
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="header-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span className="header-badge">🗝️ Golden Key Realty</span>
      </div>
    </header>
  );
}

export default Header;
