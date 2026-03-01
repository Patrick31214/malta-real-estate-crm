import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, UserCheck, MessageSquare, Activity, Globe, LogOut, Key, Calculator, Scale, Waves, GitBranch, FolderOpen, FileText, BookOpen, Camera, CalendarDays, Bell, Search, HelpCircle, Handshake } from 'lucide-react';
import { auth, inquiries } from '../services/api';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/owners', label: 'Owners', icon: Users },
  { to: '/agents', label: 'Agents', icon: UserCheck },
  { to: '/inquiries', label: 'Inquiries', icon: MessageSquare },
  { to: '/services', label: 'Services', icon: Waves },
  { to: '/branches', label: 'Branches', icon: GitBranch },
  { to: '/mortgage-calculator', label: 'Mortgage Calc', icon: Calculator },
  { to: '/file-manager', label: 'File Manager', icon: FolderOpen },
];

const adminNavItems = [
  { to: '/activity-log', label: 'Activity Log', icon: Activity },
  { to: '/compliance', label: 'Malta Compliance', icon: Scale },
];

const filesNavItems = [
  { to: '/files/contracts', label: 'Contracts', icon: FileText },
  { to: '/files/courses', label: 'Courses & Classes', icon: BookOpen },
  { to: '/files/team-pictures', label: 'Team Pictures', icon: Camera },
  { to: '/files/events', label: 'Company Events', icon: CalendarDays },
  { to: '/files/announcements', label: 'Announcements', icon: Bell },
];

const inquiryNavItems = [
  { to: '/inquiries/property', label: 'Property Inquiries', icon: Search },
  { to: '/inquiries/general', label: 'General Inquiries', icon: HelpCircle },
  { to: '/inquiries/affiliates', label: 'Affiliate Applications', icon: Users },
  { to: '/inquiries/partnerships', label: 'Partnership Inquiries', icon: Handshake },
];

function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const [newInquiryCount, setNewInquiryCount] = useState(0);

  useEffect(() => {
    if (auth.isAuthenticated()) {
      inquiries.getAll({ status: 'new', limit: 1 }).then(res => {
        if (res?.success) setNewInquiryCount(res.data.pagination?.total || 0);
      }).catch(() => {});
    }
  }, []);

  const handleLogout = async () => {
    await auth.logout();
    navigate('/login');
  };

  const user = auth.getUser();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Key size={28} strokeWidth={2} color="#D4AF37" />
        </div>
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
            <span className="nav-icon"><item.icon size={18} strokeWidth={1.75} /></span>
            <span className="nav-label">{item.label}</span>
            {item.to === '/inquiries' && newInquiryCount > 0 && (
              <span className="nav-badge">{newInquiryCount}</span>
            )}
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
                <span className="nav-icon"><item.icon size={18} strokeWidth={1.75} /></span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </>
        )}

        <p className="nav-section-title" style={{ marginTop: 16 }}>Files & Documents</p>
        {filesNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item nav-item-sub${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon"><item.icon size={16} strokeWidth={1.75} /></span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}

        <p className="nav-section-title" style={{ marginTop: 16 }}>Inquiries</p>
        {inquiryNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item nav-item-sub${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon"><item.icon size={16} strokeWidth={1.75} /></span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}

        <p className="nav-section-title" style={{ marginTop: 16 }}>Website</p>
        <a
          href="/listings"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-item"
          onClick={onClose}
        >
          <span className="nav-icon"><Globe size={18} strokeWidth={1.75} /></span>
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
          <LogOut size={16} strokeWidth={1.75} /> Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

