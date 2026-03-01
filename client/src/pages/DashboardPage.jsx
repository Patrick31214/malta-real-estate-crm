import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, CheckCircle, Handshake, Users, MessageSquare, UserCheck,
  GitBranch, TrendingUp, Tag, Home, Key, Waves, Bell, CheckCircle2,
  ClipboardCheck, Megaphone, DollarSign, BarChart2, Briefcase,
  ChevronDown, ChevronUp, Send, FileText, Bot, Activity, Award, Target,
  Euro, Anchor, Car, Compass, Settings2, X, Minimize2, Maximize2
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Legend, LineChart, Line,
} from 'recharts';
import {
  properties, owners, branches, inquiries, agents, auth, announcements,
  services, ownerContactViews, automatedContacts,
} from '../services/api';
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
function fmtEur(val) {
  const n = Math.round(parseFloat(val) || 0);
  return '€' + n.toLocaleString('en-GB');
}
function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0] || '').join('').substring(0, 2).toUpperCase();
}

// ─── constants ──────────────────────────────────────────────────
const RENTAL_TYPE_SHORT = 'short';
const MAX_ANN_TITLE_LEN = 60;

const OPEN_INQUIRY_STATUSES = ['new', 'assigned', 'in_progress', 'viewing_scheduled', 'matched', 'on_hold'];

const SERVICE_CATEGORY_CONFIG = {
  boat_tour:   { icon: Anchor,  label: 'Boat Tours' },
  car_rental:  { icon: Car,     label: 'Car Rentals' },
  bike_rental: { icon: Activity, label: 'Bike Rentals' },
  guided_tour: { icon: Compass, label: 'Guided Tours' },
  other:       { icon: Settings2, label: 'Other' },
};

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
function StatCard({ icon: Icon, label, value, linkTo, accent, sub }) {
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

function DealsBar({ propList }) {
  if (!propList.length) return <div className="chart-empty">No data yet</div>;
  const sales = propList.filter(p => p.status === 'sold').length;
  const longLets = propList.filter(p => p.status === 'rented' && p.rentalType !== 'short').length;
  const shortLets = propList.filter(p => p.status === 'rented' && p.rentalType === 'short').length;
  const data = [
    { type: 'Sales', count: sales },
    { type: 'Long Let', count: longLets },
    { type: 'Short Let', count: shortLets },
  ];
  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(64,145,108,0.1)" />
        <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#8aab99' }} />
        <YAxis tick={{ fontSize: 11, fill: '#8aab99' }} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v} deals`, 'Count']} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          <Cell fill="#c0392b" />
          <Cell fill="#2980b9" />
          <Cell fill={GOLD} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function OutreachDonut({ agentViews, aiContacts }) {
  const agentTotal = agentViews || 0;
  const aiTotal = aiContacts || 0;
  if (agentTotal === 0 && aiTotal === 0) return <div className="chart-empty">No data yet</div>;
  const data = [
    { name: 'Agent Outreach', value: agentTotal, color: E_MID },
    { name: 'AI Automated',   value: aiTotal,    color: GOLD },
  ].filter(d => d.value > 0);
  return (
    <div className="chart-with-legend">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={46} outerRadius={74}
            paddingAngle={3} dataKey="value">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pie-legend">
        {data.map(d => (
          <span key={d.name} className="pie-legend-item">
            <span className="pie-legend-dot" style={{ background: d.color }} />
            {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── chat bubble ──────────────────────────────────────────────────
function ChatBubble({ ann }) {
  const p = ann.priority || 'normal';
  const badge = PRIORITY_CONFIG[p] || PRIORITY_CONFIG.normal;
  const authorName = ann.author?.name || ann.authorName || ann.createdBy?.name || 'System';
  const ini = initials(authorName);
  const time = ann.createdAt
    ? new Date(ann.createdAt).toLocaleString('en-GB', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : '';
  const body = ann.body || ann.content || ann.message || '';
  return (
    <div className="chat-bubble">
      <div className="chat-bubble-avatar">{ini}</div>
      <div className="chat-bubble-content">
        <div className="chat-bubble-meta">
          <span className="chat-bubble-author">{authorName}</span>
          <span className="chat-bubble-time">{time}</span>
          <span
            className="ann-priority-badge chat-badge"
            style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.color}44` }}
          >
            {badge.pulse && <span className="ann-pulse-dot" style={{ background: badge.color }} />}
            {badge.label}
          </span>
        </div>
        {ann.title && <div className="chat-bubble-title">{ann.title}</div>}
        {body && <p className="chat-bubble-body">{body}</p>}
      </div>
    </div>
  );
}

// ─── announcement card (kept for reference) ───────────────────────────────────────────────────────
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
  const [propList,    setPropList]    = useState([]);
  const [inqList,     setInqList]     = useState([]);
  const [annList,     setAnnList]     = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [agentList,   setAgentList]   = useState([]);

  // Chat sidebar
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const chatListRef = useRef(null);

  const [annForm,       setAnnForm]       = useState({ title: '', body: '', priority: 'normal' });
  const [annSubmitting, setAnnSubmitting] = useState(false);

  const [stats, setStats] = useState({
    totalProperties: 0, totalOwners: 0,
    available: 0, sold: 0, rented: 0, underOffer: 0,
    totalInquiries: 0, totalAgents: 0, totalBranches: 0,
    newThisWeek: 0, forSale: 0, forRent: 0, forShortLet: 0,
    newToday: 0, openInquiries: 0, resolvedMonth: 0,
  });
  const [ownerOutreach, setOwnerOutreach] = useState({ total: 0, thisMonth: 0 });
  const [aiStats,       setAiStats]       = useState({
    totalAI: 0, totalAgent: 0, thisMonthAI: 0, thisMonthAgent: 0,
  });
  const [trendData] = useState(() => mockInquiryTrend());

  const user = auth.getUser();
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    async function load() {
      try {
        const [
          propsRes, inqRes, ownersRes, branchesRes, agentsRes, annRes,
          servicesRes, ownerViewsRes, aiRes,
        ] = await Promise.all([
          properties.getAll({ limit: 500 }).catch(() => ({ success: false })),
          inquiries.getAll({ limit: 500 }).catch(() => ({ success: false })),
          owners.getAll({ limit: 1 }).catch(() => ({ success: false })),
          branches.getAll().catch(() => ({ success: false })),
          agents.getAll({ limit: 100 }).catch(() => ({ success: false })),
          announcements.getAll().catch(() => ({ success: false })),
          services.getAll().catch(() => ({ success: false })),
          ownerContactViews.getSummary().catch(() => ({ success: false })),
          automatedContacts.getSummary().catch(() => ({ success: false })),
        ]);

        const props    = propsRes.success    ? (propsRes.data?.properties    || []) : [];
        const inqs     = inqRes.success      ? (inqRes.data?.inquiries       || []) : [];
        const agts     = agentsRes.success   ? (agentsRes.data?.agents       || []) : [];
        const svcs     = servicesRes.success ? (servicesRes.data?.services   || []) : [];

        setPropList(props);
        setInqList(inqs);
        setAgentList(agts);
        setServiceList(svcs);

        const anns = annRes.success
          ? (Array.isArray(annRes.data) ? annRes.data : (annRes.data?.announcements || []))
          : [];
        setAnnList(anns);

        if (ownerViewsRes.success) setOwnerOutreach(ownerViewsRes.data || {});
        if (aiRes.success)         setAiStats(aiRes.data || {});

        setStats({
          totalProperties: propsRes.success ? (propsRes.data?.pagination?.total ?? props.length) : 0,
          newThisWeek:     props.filter(p => isThisWeek(p.createdAt)).length,
          forSale:         props.filter(p => p.listingType === 'sale').length,
          forRent:         props.filter(p => p.listingType === 'rent').length,
          forShortLet:     props.filter(p => p.listingType === 'lease').length,
          available:       props.filter(p => p.status === 'available').length,
          underOffer:      props.filter(p => p.status === 'under_offer').length,
          sold:            props.filter(p => p.status === 'sold').length,
          rented:          props.filter(p => p.status === 'rented').length,

          totalInquiries:  inqRes.success ? (inqRes.data?.pagination?.total ?? inqs.length) : 0,
          newToday:        inqs.filter(i => isToday(i.createdAt)).length,
          openInquiries:   inqs.filter(i => OPEN_INQUIRY_STATUSES.includes(i.status)).length,
          resolvedMonth:   inqs.filter(i => i.status === 'resolved' && isThisMonth(i.updatedAt || i.createdAt)).length,

          totalAgents:   agentsRes.success   ? (agentsRes.data?.pagination?.total   ?? agts.length) : 0,
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

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [annList]);

  async function loadAnnouncements() {
    const res = await announcements.getAll().catch(() => ({ success: false }));
    const anns = res.success
      ? (Array.isArray(res.data) ? res.data : (res.data?.announcements || []))
      : [];
    setAnnList(anns);
  }

  async function handleAnnSubmit(e) {
    e.preventDefault();
    const trimmed = annForm.body.trim();
    if (!trimmed) return;
    setAnnSubmitting(true);
    try {
      await announcements.create({
        title: trimmed.length > MAX_ANN_TITLE_LEN ? trimmed.substring(0, MAX_ANN_TITLE_LEN - 3) + '…' : trimmed,
        body: trimmed,
        priority: annForm.priority,
      });
      setAnnForm({ title: '', body: '', priority: 'normal' });
      await loadAnnouncements();
    } catch (err) {
      console.error('Failed to create announcement:', err);
    } finally {
      setAnnSubmitting(false);
    }
  }

  // ── computed deal/revenue metrics ──────────────────────────────
  const soldProps       = propList.filter(p => p.status === 'sold');
  const rentedProps     = propList.filter(p => p.status === 'rented');
  const longLetProps    = rentedProps.filter(p => p.rentalType !== RENTAL_TYPE_SHORT);
  const shortLetProps   = rentedProps.filter(p => p.rentalType === RENTAL_TYPE_SHORT);

  const salesRevenue    = soldProps.reduce((s, p) => s + parseFloat(p.price || 0), 0);
  const longLetRevenue  = longLetProps.reduce((s, p) => s + parseFloat(p.price || 0), 0);
  const shortLetRevenue = shortLetProps.reduce((s, p) => s + parseFloat(p.price || 0), 0);
  const totalRevenue    = salesRevenue + longLetRevenue + shortLetRevenue;

  const dealsThisMonth  = propList.filter(p =>
    (p.status === 'sold' || p.status === 'rented') && isThisMonth(p.updatedAt || p.createdAt)
  ).length;

  // ── agent performance metrics ──────────────────────────────────
  const activeAgents    = agentList.filter(a => a.isActive !== false).length;
  const topPerformer    = agentList.reduce((top, a) => {
    const cnt = parseInt(a.propertiesCount || 0);
    if (cnt > (top?.count || 0)) {
      const name = [a.user?.firstName, a.user?.lastName].filter(Boolean).join(' ') || 'Agent';
      return { name, count: cnt };
    }
    return top;
  }, null);
  const totalAgentCount = stats.totalAgents || agentList.length || 1;
  const avgPropsPerAgent = (stats.totalProperties / totalAgentCount).toFixed(1);
  const avgInqPerAgent   = (stats.totalInquiries / totalAgentCount).toFixed(1);

  // ── services metrics ───────────────────────────────────────────
  const activeServices = serviceList.filter(s => s.isActive !== false).length;
  const svcByCategory  = serviceList.reduce((map, s) => {
    const cat = s.category || 'other';
    map[cat] = (map[cat] || 0) + 1;
    return map;
  }, {});

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
    <div className="dash-layout">
      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div className="dashboard">
        {/* ── HEADER ───────────────────────────────────────── */}
        <div className="dash-header">
          <h1 className="dash-title">Command Center</h1>
          <p className="dash-subtitle">Golden Key Realty — live metrics overview</p>
        </div>

        {/* ── ROW 1: PROPERTIES ────────────────────────────── */}
        <section className="dash-section">
          <SectionHeading icon={Building2} title="Properties" linkTo="/properties" />
          <div className="dash-cards-row">
            <StatCard icon={Building2}  label="Total Properties" value={stats.totalProperties}  linkTo="/properties"                       accent={E_DARK} />
            <StatCard icon={TrendingUp} label="New This Week"    value={stats.newThisWeek}       linkTo="/properties"                       accent={E_MID}  />
            <StatCard icon={CheckCircle} label="Available"       value={stats.available}          linkTo="/properties?status=available"      accent={E_MID}  />
            <StatCard icon={Handshake}  label="Under Offer"      value={stats.underOffer}         linkTo="/properties?status=under_offer"    accent={GOLD}   />
          </div>
          <div className="dash-cards-row">
            <StatCard icon={Tag}   label="For Sale"    value={stats.forSale}     linkTo="/properties?listingType=sale"      accent={GOLD}  />
            <StatCard icon={Home}  label="For Rent"    value={stats.forRent}     linkTo="/properties?listingType=rent"      accent={GOLD2} />
            <StatCard icon={Waves} label="Short Let"   value={stats.forShortLet} linkTo="/properties?listingType=lease"     accent={E_MID} />
          </div>
        </section>

        {/* ── ROW 2: DEALS & REVENUE ────────────────────────── */}
        <section className="dash-section">
          <SectionHeading icon={DollarSign} title="Deals &amp; Revenue" linkTo="/properties" />
          <div className="dash-cards-row">
            <StatCard icon={CheckCircle2} label="Sales Closed"   value={soldProps.length}      linkTo="/properties?status=sold"   accent="#c0392b" sub={fmtEur(salesRevenue)} />
            <StatCard icon={Key}          label="Long Lets"       value={longLetProps.length}   linkTo="/properties?status=rented" accent="#2980b9" sub={fmtEur(longLetRevenue)} />
            <StatCard icon={Waves}        label="Short Lets"      value={shortLetProps.length}  linkTo="/properties?status=rented" accent={GOLD}    sub={fmtEur(shortLetRevenue)} />
            <StatCard icon={Euro}         label="Total Revenue"   value={fmtEur(totalRevenue)}  linkTo="/properties"               accent={E_MID}  />
          </div>
          <div className="dash-cards-row dash-cards-row--narrow">
            <StatCard icon={BarChart2}    label="Deals This Month" value={dealsThisMonth}        linkTo="/properties"               accent={GOLD2}  />
          </div>
        </section>

        {/* ── ROW 3: INQUIRIES ─────────────────────────────── */}
        <section className="dash-section">
          <SectionHeading icon={MessageSquare} title="Inquiries" linkTo="/dashboard/inquiries" />
          <div className="dash-cards-row">
            <StatCard icon={MessageSquare}  label="Total Inquiries"      value={stats.totalInquiries} linkTo="/dashboard/inquiries"               accent={E_DARK} />
            <StatCard icon={Bell}           label="New Today"             value={stats.newToday}       linkTo="/dashboard/inquiries"               accent={GOLD}   />
            <StatCard icon={Key}            label="Open Inquiries"        value={stats.openInquiries}  linkTo="/dashboard/inquiries"               accent={E_MID}  />
            <StatCard icon={ClipboardCheck} label="Resolved This Month"   value={stats.resolvedMonth}  linkTo="/dashboard/inquiries?status=resolved" accent={GOLD2} />
          </div>
        </section>

        {/* ── ROW 4: OWNER OUTREACH ─────────────────────────── */}
        <section className="dash-section">
          <SectionHeading icon={Users} title="Owner Outreach" linkTo="/dashboard/owners" />
          <div className="dash-cards-row">
            <StatCard icon={UserCheck} label="Agent-Viewed Contacts" value={ownerOutreach.total}         linkTo="/dashboard/owners" accent={E_MID}  />
            <StatCard icon={UserCheck} label="Contacts This Month"   value={ownerOutreach.thisMonth}      linkTo="/dashboard/owners" accent={GOLD}   />
            <StatCard icon={Bot}       label="AI Automated Contacts" value={aiStats.totalAI}              linkTo="/dashboard/owners" accent="#8e44ad" />
            <StatCard icon={Activity}  label="Agent-Initiated Comms" value={aiStats.totalAgent}           linkTo="/dashboard/owners" accent={GOLD2}  />
          </div>
        </section>

        {/* ── ROW 5: AGENT PERFORMANCE ─────────────────────── */}
        <section className="dash-section">
          <SectionHeading icon={UserCheck} title="Agent Performance" linkTo="/dashboard/agents" />
          <div className="dash-cards-row">
            <StatCard icon={UserCheck} label="Total Agents"          value={stats.totalAgents}              linkTo="/dashboard/agents" accent={E_DARK} />
            <StatCard icon={Activity}  label="Active Agents"         value={activeAgents}                    linkTo="/dashboard/agents" accent={E_MID}  />
            <StatCard icon={Target}    label="Avg Props / Agent"     value={avgPropsPerAgent}                linkTo="/dashboard/agents" accent={GOLD}   />
            <StatCard icon={MessageSquare} label="Avg Inquiries / Agent" value={avgInqPerAgent}             linkTo="/dashboard/agents" accent={GOLD2}  />
            <StatCard icon={Award}     label="Top Performer"         value={topPerformer?.name || '—'}       linkTo="/dashboard/agents" accent={E_MID} sub={topPerformer ? `${topPerformer.count} properties` : undefined} />
          </div>
        </section>

        {/* ── ROW 6: OWNERS, BRANCHES ──────────────────────── */}
        <section className="dash-section">
          <div className="dash-cards-row dash-cards-row--narrow">
            <StatCard icon={Users}     label="Total Owners"   value={stats.totalOwners}   linkTo="/dashboard/owners"   accent={E_MID} />
            <StatCard icon={GitBranch} label="Total Branches" value={stats.totalBranches} linkTo="/dashboard/branches" accent={GOLD}  />
          </div>
        </section>

        {/* ── ROW 7: SERVICES ──────────────────────────────── */}
        <section className="dash-section">
          <SectionHeading icon={Briefcase} title="Services" linkTo="/services" />
          <div className="dash-cards-row">
            <StatCard icon={Briefcase} label="Total Services"  value={serviceList.length} linkTo="/services" accent={E_DARK} />
            <StatCard icon={CheckCircle} label="Active Services" value={activeServices}   linkTo="/services" accent={E_MID}  />
            {Object.entries(svcByCategory).map(([cat, count]) => {
              const cfg = SERVICE_CATEGORY_CONFIG[cat] || SERVICE_CATEGORY_CONFIG.other;
              return (
                <StatCard key={cat} icon={cfg.icon} label={cfg.label} value={count} linkTo="/services" accent={GOLD2} />
              );
            })}
          </div>
        </section>

        {/* ── ROW 8: DOCUMENTS ─────────────────────────────── */}
        <section className="dash-section">
          <div className="dash-cards-row dash-cards-row--narrow">
            <StatCard icon={FileText} label="File Manager" value="Open" linkTo="/file-manager" accent={GOLD} />
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
            <div className="dash-chart-card">
              <h3 className="dash-chart-title">Deals by Type</h3>
              <DealsBar propList={propList} />
            </div>
            <div className="dash-chart-card">
              <h3 className="dash-chart-title">Owner Outreach — Agent vs AI</h3>
              <OutreachDonut agentViews={ownerOutreach.total} aiContacts={aiStats.totalAI} />
            </div>
          </div>
        </section>
      </div>

      {/* ── CHAT SIDEBAR ─────────────────────────────────── */}
      <aside className={`dash-chat-sidebar${sidebarMinimized ? ' dash-chat-sidebar--minimized' : ''}`}>
        <div className="chat-sidebar-header">
          <span className="chat-sidebar-title">
            <Megaphone size={15} strokeWidth={1.75} />
            Team Channel
          </span>
          <button
            className="chat-sidebar-toggle"
            onClick={() => setSidebarMinimized(m => !m)}
            aria-label={sidebarMinimized ? 'Expand' : 'Minimize'}
            title={sidebarMinimized ? 'Expand' : 'Minimize'}
          >
            {sidebarMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
        </div>

        {!sidebarMinimized && (
          <>
            <div className="chat-list" ref={chatListRef}>
              {annList.length === 0 ? (
                <div className="chat-empty">
                  <Megaphone size={28} strokeWidth={1.25} style={{ color: 'rgba(212,175,55,0.4)' }} />
                  <p>No announcements yet.</p>
                </div>
              ) : (
                [...annList].reverse().map(ann => (
                  <ChatBubble key={ann._id || ann.id || ann.title + ann.createdAt} ann={ann} />
                ))
              )}
            </div>

            {isAdmin && (
              <form className="chat-input-bar" onSubmit={handleAnnSubmit}>
                <input
                  className="chat-input"
                  placeholder="Broadcast a message…"
                  value={annForm.body}
                  onChange={e => setAnnForm(f => ({ ...f, body: e.target.value }))}
                />
                <select
                  className="chat-priority-select"
                  value={annForm.priority}
                  onChange={e => setAnnForm(f => ({ ...f, priority: e.target.value }))}
                  title="Priority"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button type="submit" className="chat-send-btn" disabled={annSubmitting || !annForm.body.trim()} title="Send">
                  <Send size={15} />
                </button>
              </form>
            )}
          </>
        )}
      </aside>

      {/* ── MOBILE CHAT TOGGLE ────────────────────────────── */}
      <button
        className="chat-mobile-fab"
        onClick={() => setMobileSidebarOpen(o => !o)}
        aria-label="Toggle announcements"
      >
        <Megaphone size={22} />
        {annList.length > 0 && <span className="chat-mobile-badge">{annList.length}</span>}
      </button>

      {mobileSidebarOpen && (
        <div className="chat-mobile-drawer">
          <div className="chat-mobile-drawer-header">
            <span>📢 Team Channel</span>
            <button onClick={() => setMobileSidebarOpen(false)} className="chat-sidebar-toggle">
              <X size={16} />
            </button>
          </div>
          <div className="chat-list chat-list--mobile" ref={chatListRef}>
            {annList.length === 0 ? (
              <div className="chat-empty"><p>No announcements yet.</p></div>
            ) : (
              [...annList].reverse().map(ann => (
                <ChatBubble key={ann._id || ann.id || ann.title + ann.createdAt} ann={ann} />
              ))
            )}
          </div>
          {isAdmin && (
            <form className="chat-input-bar" onSubmit={e => { handleAnnSubmit(e); setMobileSidebarOpen(false); }}>
              <input
                className="chat-input"
                placeholder="Broadcast a message…"
                value={annForm.body}
                onChange={e => setAnnForm(f => ({ ...f, body: e.target.value }))}
              />
              <select
                className="chat-priority-select"
                value={annForm.priority}
                onChange={e => setAnnForm(f => ({ ...f, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <button type="submit" className="chat-send-btn" disabled={annSubmitting || !annForm.body.trim()}>
                <Send size={15} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;

