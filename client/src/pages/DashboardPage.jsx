import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle, Handshake, Users, Calculator, MapPin, MessageSquare, UserCheck, GitBranch } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { properties, owners, activityLogs, branches, inquiries, agents } from '../services/api';
import {
  Building2, TrendingUp, Tag, Home, Key, Waves,
  MessageSquare, Bell, CheckCircle2, ClipboardCheck,
  UserCheck, Users, GitBranch, Megaphone,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line,
} from 'recharts';
import { properties, owners, branches, inquiries, agents, auth, announcements } from '../services/api';
import './DashboardPage.css';

// ─── priority config ─────────────────────────────────────────────
const PRIORITY_CONFIG = {
  low:    { color: '#888888', bg: 'rgba(136,136,136,0.15)', label: 'Low',    pulse: false },
  normal: { color: '#2980b9', bg: 'rgba(41,128,185,0.15)',  label: 'Normal', pulse: false },
  high:   { color: '#e67e22', bg: 'rgba(230,126,34,0.15)',  label: 'High',   pulse: false },
  urgent: { color: '#c0392b', bg: 'rgba(192,57,43,0.15)',   label: 'Urgent', pulse: true  },
};

// ─── colour tokens ───────────────────────────────────────────────
const E_DARK  = '#2D6A4F';
const E_MID   = '#40916C';
const GOLD    = '#D4AF37';
const GOLD2   = '#B8962E';
const STATUS_COLORS = {
  available:   '#40916C',
  under_offer: '#D4AF37',
  sold:        '#c0392b',
  rented:      '#2980b9',
  draft:       '#666',
  withdrawn:   '#888',
};
const TOOLTIP_STYLE = {
  background: 'rgba(10,20,15,0.95)',
  border: `1px solid rgba(45,106,79,0.35)`,
  borderRadius: 8,
  color: '#e8f5e9',
  fontSize: 12,
};

// ─── helpers ─────────────────────────────────────────────────────
function isThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo && d <= now;
}
function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}
function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

const OPEN_INQUIRY_STATUSES = ['new', 'assigned', 'in_progress', 'viewing_scheduled', 'matched', 'on_hold'];

// Generate mock inquiry trend for last 7 days
function mockInquiryTrend() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      day: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' }),
      inquiries: Math.floor(Math.random() * 8) + 1,
    });
  }
  return days;
}

// ─── skeleton loader ─────────────────────────────────────────────
function SkeletonCard() {
  return <div className="dash-skeleton-card" />;
}

// ─── stat card ───────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, linkTo, accent }) {
  return (
    <Link to={linkTo} className="dash-stat-card" style={{ '--accent': accent || E_DARK }}>
      <div className="dash-stat-icon">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <div className="dash-stat-body">
        <span className="dash-stat-value">{value ?? '—'}</span>
        <span className="dash-stat-label">{label}</span>
      </div>
      <span className="dash-stat-arrow">›</span>
    </Link>
  );
}

// ─── section heading ─────────────────────────────────────────────
function SectionHeading({ icon: Icon, title, linkTo, linkLabel }) {
  return (
    <div className="dash-section-heading">
      <span className="dash-section-gold-bar" />
      <Icon size={18} strokeWidth={1.75} className="dash-section-icon" />
      <h2 className="dash-section-title">{title}</h2>
      {linkTo && (
        <Link to={linkTo} className="dash-section-link">{linkLabel || 'View all →'}</Link>
      )}
    </div>
  );
}

// ─── charts ──────────────────────────────────────────────────────
function StatusDonut({ propList }) {
  const counts = {};
  propList.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
  const data = Object.entries(counts)
    .map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] || '#888' }))
    .filter(d => d.value > 0);

  if (data.length === 0) return <div className="chart-empty">No data yet</div>;

  return (
    <div className="chart-with-legend">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={82}
            paddingAngle={3} dataKey="value">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE}
            formatter={(v, n) => [v, n.replace(/_/g, ' ')]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pie-legend">
        {data.map(d => (
          <span key={d.name} className="pie-legend-item">
            <span className="pie-legend-dot" style={{ background: d.color }} />
            {d.name.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}

function TypeBar({ propList }) {
  if (!propList.length) return <div className="chart-empty">No data yet</div>;
  const map = {};
  propList.forEach(p => {
    const t = p.propertyType || 'other';
    map[t] = (map[t] || 0) + 1;
  });
  const data = Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '),
      count,
    }));

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(64,145,108,0.1)" />
        <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#8aab99' }} />
        <YAxis tick={{ fontSize: 11, fill: '#8aab99' }} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE}
          formatter={v => [`${v} properties`, 'Count']} />
        <Bar dataKey="count" fill={GOLD} radius={[4, 4, 0, 0]} name="Properties" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function InquiryLine({ trendData }) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <LineChart data={trendData} margin={{ top: 4, right: 16, bottom: 4, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(64,145,108,0.1)" />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#8aab99' }} />
        <YAxis tick={{ fontSize: 11, fill: '#8aab99' }} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE}
          formatter={v => [`${v} inquiries`, 'Count']} />
        <Line type="monotone" dataKey="inquiries" stroke={E_MID}
          strokeWidth={2.5} dot={{ r: 4, fill: GOLD, stroke: E_MID }}
          activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── announcement card ────────────────────────────────────────────
function AnnouncementCard({ ann }) {
  const p = ann.priority || 'normal';
  const badge = PRIORITY_CONFIG[p] || PRIORITY_CONFIG.normal;
  const authorName = ann.author?.name || ann.authorName || ann.createdBy?.name || 'Unknown';
  const date = ann.createdAt
    ? new Date(ann.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  return (
    <div className="ann-card">
      <div className="ann-card-header">
        <span className="ann-card-title">{ann.title}</span>
        <span
          className="ann-priority-badge"
          style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.color}55` }}
        >
          {badge.pulse && <span className="ann-pulse-dot" style={{ background: badge.color }} />}
          {badge.label}
        </span>
      </div>
      <p className="ann-card-body">{ann.body || ann.content || ann.message}</p>
      {(authorName || date) && (
        <div className="ann-card-meta">
          {authorName && <span>{authorName}</span>}
          {authorName && date && <span>·</span>}
          {date && <span>{date}</span>}
        </div>
      )}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────
function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [propList,   setPropList]   = useState([]);
  const [inqList,    setInqList]    = useState([]);
  const [annList,    setAnnList]    = useState([]);
  const [showAnnForm,   setShowAnnForm]   = useState(false);
  const [annForm,       setAnnForm]       = useState({ title: '', body: '', priority: 'normal' });
  const [annSubmitting, setAnnSubmitting] = useState(false);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalOwners: 0,
    available: 0,
    sold: 0,
    rented: 0,
    underOffer: 0,
    totalInquiries: 0,
    totalAgents: 0,
    totalBranches: 0,
    totalProperties: 0, newThisWeek: 0,
    forSale: 0, forRent: 0, forShortLet: 0,
    totalInquiries: 0, newToday: 0, openInquiries: 0, resolvedMonth: 0,
    totalAgents: 0, totalOwners: 0, totalBranches: 0,
  });
  const [trendData] = useState(() => mockInquiryTrend());

  const user = auth.getUser();
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    async function load() {
      try {
        const [propsRes, ownersRes, activityRes, branchesRes, inquiriesRes, agentsRes] = await Promise.all([
          properties.getAll({ limit: 100 }),
          owners.getAll({ limit: 1 }),
          activityLogs.getAll({ limit: 10 }).catch(() => ({ success: false })),
          branches.getAll().catch(() => ({ success: false })),
          inquiries.getAll({ limit: 1 }).catch(() => ({ success: false })),
          agents.getAll({ limit: 1 }).catch(() => ({ success: false }))
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
            underOffer: props.filter(p => p.status === 'under_offer').length,
            totalInquiries: inquiriesRes.success ? (inquiriesRes.data?.pagination?.total ?? 0) : 0,
            totalAgents: agentsRes.success ? (agentsRes.data?.pagination?.total ?? 0) : 0,
            totalBranches: branchesRes.success ? (Array.isArray(branchesRes.data?.branches) ? branchesRes.data.branches.length : (Array.isArray(branchesRes.data) ? branchesRes.data.length : 0)) : 0,
          });
          setAllProperties(props);
        }

        if (activityRes.success) {
          setActivityFeed(activityRes.data?.logs || activityRes.data || []);
        }

        if (branchesRes.success) {
          const branchList = branchesRes.data?.branches || branchesRes.data || [];
          setBranchData(Array.isArray(branchList) ? branchList : []);
        }
        const [propsRes, inqRes, ownersRes, branchesRes, agentsRes, annRes] = await Promise.all([
          properties.getAll({ limit: 200 }).catch(() => ({ success: false })),
          inquiries.getAll({ limit: 200 }).catch(() => ({ success: false })),
          owners.getAll({ limit: 1 }).catch(() => ({ success: false })),
          branches.getAll().catch(() => ({ success: false })),
          agents.getAll({ limit: 1 }).catch(() => ({ success: false })),
          announcements.getAll().catch(() => ({ success: false })),
        ]);

        const props = propsRes.success ? (propsRes.data?.properties || []) : [];
        const inqs  = inqRes.success  ? (inqRes.data?.inquiries  || []) : [];

        setPropList(props);
        setInqList(inqs);

        const anns = annRes.success
          ? (Array.isArray(annRes.data) ? annRes.data : (annRes.data?.announcements || []))
          : [];
        setAnnList(anns);

        setStats({
          totalProperties: propsRes.success ? (propsRes.data?.pagination?.total ?? props.length) : 0,
          newThisWeek:     props.filter(p => isThisWeek(p.createdAt)).length,
          forSale:         props.filter(p => p.listingType === 'sale').length,
          forRent:         props.filter(p => p.listingType === 'rent').length,
          forShortLet:     props.filter(p => p.listingType === 'short_let').length,

          totalInquiries:  inqRes.success ? (inqRes.data?.pagination?.total ?? inqs.length) : 0,
          newToday:        inqs.filter(i => isToday(i.createdAt)).length,
          openInquiries:   inqs.filter(i => OPEN_INQUIRY_STATUSES.includes(i.status)).length,
          resolvedMonth:   inqs.filter(i => i.status === 'resolved' && isThisMonth(i.updatedAt || i.createdAt)).length,

          totalAgents:   agentsRes.success   ? (agentsRes.data?.pagination?.total   ?? 0) : 0,
          totalOwners:   ownersRes.success   ? (ownersRes.data?.pagination?.total   ?? 0) : 0,
          totalBranches: branchesRes.success
            ? (branchesRes.data?.branches?.length ?? branchesRes.data?.length ?? 0)
            : 0,
        });
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function loadAnnouncements() {
    const res = await announcements.getAll().catch(() => ({ success: false }));
    const anns = res.success
      ? (Array.isArray(res.data) ? res.data : (res.data?.announcements || []))
      : [];
    setAnnList(anns);
  }

  async function handleAnnSubmit(e) {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.body.trim()) return;
    setAnnSubmitting(true);
    try {
      await announcements.create(annForm);
      setAnnForm({ title: '', body: '', priority: 'normal' });
      setShowAnnForm(false);
      await loadAnnouncements();
    } catch (err) {
      console.error('Failed to create announcement:', err);
    } finally {
      setAnnSubmitting(false);
    }
  }

  // ── skeleton ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dashboard">
        {[1, 2, 3].map(row => (
          <div key={row} className="dash-skeleton-row">
            {[1, 2, 3, 4].map(c => <SkeletonCard key={c} />)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Stats grid */}
      <div className="stats-grid">
        <StatCard icon={Building2} label="Total Properties" value={stats.totalProperties} color="#1e3a5f" linkTo="/dashboard/properties" />
        <StatCard icon={CheckCircle} label="Available" value={stats.available} color="var(--emerald-primary, #2D6A4F)" linkTo="/dashboard/properties" />
        <StatCard icon={Handshake} label="Under Offer" value={stats.underOffer} color="#e8a020" linkTo="/dashboard/properties" />
        <StatCard icon={Users} label="Owners" value={stats.totalOwners} color="#8e44ad" linkTo="/dashboard/owners" />
        <StatCard icon={MessageSquare} label="Inquiries" value={stats.totalInquiries} color="#0e7490" linkTo="/dashboard/inquiries" />
        <StatCard icon={UserCheck} label="Agents" value={stats.totalAgents} color="#2D6A4F" linkTo="/dashboard/agents" />
        <StatCard icon={GitBranch} label="Branches" value={stats.totalBranches} color="#D4AF37" linkTo="/dashboard/branches" />
      {/* ── HEADER ───────────────────────────────────────── */}
      <div className="dash-header">
        <h1 className="dash-title">Command Center</h1>
        <p className="dash-subtitle">Golden Key Realty — live metrics overview</p>
      </div>

      {/* ── ROW 1: PROPERTIES ────────────────────────────── */}
      <section className="dash-section">
        <SectionHeading icon={Building2} title="Properties" linkTo="/properties" />
        <div className="dash-cards-row">
          <StatCard icon={Building2}  label="Total Properties"       value={stats.totalProperties} linkTo="/properties"                  accent={E_DARK} />
          <StatCard icon={TrendingUp} label="New This Week"          value={stats.newThisWeek}     linkTo="/properties"                  accent={E_MID}  />
          <StatCard icon={Tag}        label="For Sale"               value={stats.forSale}         linkTo="/properties?listingType=sale" accent={GOLD}   />
          <StatCard icon={Home}       label="For Rent"               value={stats.forRent}         linkTo="/properties?listingType=rent" accent={GOLD2}  />
          <StatCard icon={Waves}      label="Short Let"              value={stats.forShortLet}     linkTo="/properties?listingType=short_let" accent={E_MID} />
        </div>
      </section>

      {/* ── ROW 2: INQUIRIES ─────────────────────────────── */}
      <section className="dash-section">
        <SectionHeading icon={MessageSquare} title="Inquiries" linkTo="/inquiries" />
        <div className="dash-cards-row">
          <StatCard icon={MessageSquare}  label="Total Inquiries"    value={stats.totalInquiries}  linkTo="/inquiries"               accent={E_DARK} />
          <StatCard icon={Bell}           label="New Today"          value={stats.newToday}        linkTo="/inquiries"               accent={GOLD}   />
          <StatCard icon={Key}            label="Open Inquiries"     value={stats.openInquiries}   linkTo="/inquiries"               accent={E_MID}  />
          <StatCard icon={ClipboardCheck} label="Resolved This Month" value={stats.resolvedMonth}  linkTo="/inquiries?status=resolved" accent={GOLD2} />
        </div>
      </section>

      {/* ── ROW 3: AGENTS ────────────────────────────────── */}
      <section className="dash-section">
        <SectionHeading icon={UserCheck} title="Agents" linkTo="/agents" />
        <div className="dash-cards-row dash-cards-row--narrow">
          <StatCard icon={UserCheck} label="Total Agents" value={stats.totalAgents} linkTo="/agents" accent={E_DARK} />
        </div>
      </section>

      {/* ── ROW 4: OWNERS ────────────────────────────────── */}
      <section className="dash-section">
        <SectionHeading icon={Users} title="Owners" linkTo="/owners" />
        <div className="dash-cards-row dash-cards-row--narrow">
          <StatCard icon={Users} label="Total Owners" value={stats.totalOwners} linkTo="/owners" accent={E_MID} />
        </div>
      </section>

      {/* ── ROW 5: BRANCHES ──────────────────────────────── */}
      <section className="dash-section">
        <SectionHeading icon={GitBranch} title="Branches" linkTo="/branches" />
        <div className="dash-cards-row dash-cards-row--narrow">
          <StatCard icon={GitBranch} label="Total Branches" value={stats.totalBranches} linkTo="/branches" accent={GOLD} />
        </div>
      </section>

      {/* ── CHARTS ───────────────────────────────────────── */}
      <section className="dash-section">
        <SectionHeading icon={CheckCircle2} title="Analytics" />
        <div className="dash-charts-grid">
          <div className="dash-chart-card">
            <h3 className="dash-chart-title">Property Status Distribution</h3>
            <StatusDonut propList={propList} />
          </div>
          <div className="dash-chart-card">
            <h3 className="dash-chart-title">Properties by Type</h3>
            <TypeBar propList={propList} />
          </div>
          <div className="dash-chart-card">
            <h3 className="dash-chart-title">Inquiries — Last 7 Days</h3>
            <InquiryLine trendData={trendData} />
            <p className="dash-chart-note">* Placeholder trend — real time-series data coming soon</p>
          </div>
        </div>
      </section>

      {/* ── COMPANY FEED ─────────────────────────────────── */}
      <section className="dash-section">
        <SectionHeading icon={Megaphone} title="Company Feed" />

        {isAdmin && (
          <div className="dash-ann-actions">
            <button
              className="btn btn-primary"
              onClick={() => setShowAnnForm(f => !f)}
            >
              {showAnnForm ? '✕ Cancel' : '+ Create Announcement'}
            </button>
          </div>
        )}

        {isAdmin && showAnnForm && (
          <form className="dash-ann-form dash-chart-card" onSubmit={handleAnnSubmit}>
            <div className="dash-ann-form-group">
              <label className="dash-ann-label">Title</label>
              <input
                className="dash-ann-input"
                type="text"
                placeholder="Announcement title…"
                value={annForm.title}
                onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="dash-ann-form-group">
              <label className="dash-ann-label">Body</label>
              <textarea
                className="dash-ann-input dash-ann-textarea"
                placeholder="Write your announcement…"
                value={annForm.body}
                onChange={e => setAnnForm(f => ({ ...f, body: e.target.value }))}
                rows={4}
                required
              />
            </div>
            <div className="dash-ann-form-group">
              <label className="dash-ann-label">Priority</label>
              <select
                className="dash-ann-input dash-ann-select"
                value={annForm.priority}
                onChange={e => setAnnForm(f => ({ ...f, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="dash-ann-form-footer">
              <button type="submit" className="btn btn-primary" disabled={annSubmitting}>
                {annSubmitting ? 'Posting…' : 'Post Announcement'}
              </button>
            </div>
          </form>
        )}

        <div className="dash-feed-card">
          {annList.length === 0 ? (
            <div className="dash-feed-empty">
              <Megaphone size={36} strokeWidth={1.25} className="dash-feed-empty-icon" />
              <p className="dash-feed-empty-text">No announcements yet.</p>
              <p className="dash-feed-empty-sub">
                Stay tuned — company-wide announcements will appear here.
              </p>
            </div>
          ) : (
            <div className="dash-feed-list">
              {annList.map(ann => (
                <AnnouncementCard key={ann._id || ann.id || ann.title} ann={ann} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;

