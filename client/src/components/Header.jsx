import { useLocation } from 'react-router-dom';
import { Sun, Moon, KeyRound } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import NotificationBell from './NotificationBell';
import GlobalSearch from './GlobalSearch';
import './Header.css';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/properties': 'Properties',
  '/owners': 'Owners',
  '/inquiries': 'Inquiries',
  '/agents': 'Agents',
  '/activity-log': 'Activity Log',
  '/mortgage-calculator': 'Mortgage Calculator',
  '/compliance': 'Malta Compliance'
};

function Header({ onMenuClick }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Golden Key Realty';
  const { theme, toggleTheme } = useTheme();
  const { currency, changeCurrency, currencies } = useCurrency();

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
          ☰
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="header-center">
        <GlobalSearch />
      </div>
      <div className="header-right">
        <select
          className="currency-select"
          value={currency}
          onChange={e => changeCurrency(e.target.value)}
          title="Select currency"
        >
          {Object.entries(currencies).map(([code, c]) => (
            <option key={code} value={code}>{c.symbol} {c.label}</option>
          ))}
        </select>
        <NotificationBell />
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
        </button>
        <span className="header-badge">
          <KeyRound size={14} strokeWidth={2} style={{ color: '#D4AF37' }} /> Golden Key Realty
        </span>
      </div>
    </header>
  );
}

export default Header;
