import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Building2, CheckCircle, Handshake, Users, MessageSquare, UserCheck,
  GitBranch, TrendingUp, Tag, Home, Waves, Bell, CheckCircle2,
  ClipboardCheck, Megaphone, DollarSign, BarChart2, Briefcase,
  Send, FileText, Bot, Activity, Award, Target,
  Euro, X, Minimize2, Maximize2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  properties, owners, branches, inquiries, agents, auth, announcements,
  services, ownerContactViews, automatedContacts,
} from '../services/api';
import {
  E_DARK, E_MID, GOLD, GOLD2, TOOLTIP_STYLE,
  RENTAL_TYPE_SHORT, MAX_ANN_TITLE_LEN, OPEN_INQUIRY_STATUSES, SERVICE_CATEGORY_CONFIG,
  isThisWeek, isToday, isThisMonth, fmtEur,
} from '../components/dashboard/constants';
import { StatCard } from '../components/dashboard/StatCard';
import { SectionHeading } from '../components/dashboard/SectionHeading';
import { ChatBubble } from '../components/dashboard/ChatBubble';
import { StatusDonut } from '../components/dashboard/charts/StatusDonut';
import { TypeBar } from '../components/dashboard/charts/TypeBar';
import { InquiryLine } from '../components/dashboard/charts/InquiryLine';
import { DealsBar } from '../components/dashboard/charts/DealsBar';
import { OutreachDonut } from '../components/dashboard/charts/OutreachDonut';
import './DashboardPage.css';

// ─── channel config ──────────────────────────────────────────────
const CHANNELS = [
  { id: 'all',         label: 'Team',     icon: Users      },
  { id: 'managers',    label: 'Managers', icon: Briefcase  },
  { id: 'rental_team', label: 'Rentals',  icon: Home       },
  { id: 'employees',   label: 'Staff',    icon: UserCheck  },
  { id: 'partners',    label: 'Partners', icon: Handshake  },
];

function isChannelVisible(channelId, user) {
  if (!user) return channelId === 'all' || channelId === 'partners';
  const role = user.role;
  const isAdminOrMgr = role === 'admin' || role === 'manager';
  switch (channelId) {
    case 'all':         return true;
    case 'managers':    return isAdminOrMgr;
    case 'rental_team': return isAdminOrMgr || (role === 'agent' && (user.subRole || '').includes('rental'));
    case 'employees':   return isAdminOrMgr || role === 'employee';
    case 'partners':    return true;
    default:            return false;
  }
}

// ─── skeleton loader ─────────────────────────────────────────────
function SkeletonCard() {
  return <div className="dash-skeleton-card" />;
}

// ─── registrations chart ─────────────────────────────────────────
function RegistrationsChart({ propList, inqCount, agentList }) {
  const data = [
    { name: 'Properties', count: propList.filter(p => isThisMonth(p.createdAt)).length },
    { name: 'Inquiries',  count: inqCount },
    { name: 'Agents',     count: agentList.filter(a => isThisMonth(a.createdAt)).length },
  ];
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <div className="chart-empty">No registrations this month</div>;
  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(64,145,108,0.1)" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8aab99' }} />
        <YAxis tick={{ fontSize: 11, fill: '#8aab99' }} allowDecimals={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v} registered`, 'Count']} />
        <Bar dataKey="count" fill={E_MID} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}


// ─── main component ──────────────────────────────────────────────
function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [propList,    setPropList]    = useState([]);
  const [annList,     setAnnList]     = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [agentList,   setAgentList]   = useState([]);
  const [trendData,   setTrendData]   = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);

  // Chat sidebar
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState('all');
  const chatListRef = useRef(null);

  const [annForm,       setAnnForm]       = useState({ title: '', body: '', priority: 'normal' });
  const [annSubmitting, setAnnSubmitting] = useState(false);

  const [stats, setStats] = useState({
    totalProperties: 0, totalOwners: 0,
    available: 0, sold: 0, rented: 0, underOffer: 0,
    totalInquiries: 0, totalAgents: 0, totalBranches: 0,
    newThisWeek: 0, forSale: 0, forRent: 0, forShortLet: 0,
    newToday: 0, openInquiries: 0, resolvedMonth: 0,
    inqsThisMonth: 0,
  });
  const [ownerOutreach, setOwnerOutreach] = useState({ total: 0, thisMonth: 0 });
  const [aiStats,       setAiStats]       = useState({
    totalAI: 0, totalAgent: 0, thisMonthAI: 0, thisMonthAgent: 0,
  });

  const user = auth.getUser();
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  // Announcements filtered to the active channel
  const activeChannelAnnList = useMemo(
    () => annList.filter(ann => (ann.targetType || 'all') === activeChannel),
    [annList, activeChannel]
  );

  // Visible channels for this user
  const visibleChannels = useMemo(
    () => CHANNELS.filter(ch => isChannelVisible(ch.id, user)),
    [user]
  );

  useEffect(() => {
    async function load() {
      try {
        const [
          propsRes, inqRes, ownersRes, branchesRes, agentsRes, annRes,
          servicesRes, ownerViewsRes, aiRes, trendRes,
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
          inquiries.getTrend().catch(() => ({ success: false })),
        ]);

        const props = propsRes.success    ? (propsRes.data?.properties    || []) : [];
        const inqs  = inqRes.success      ? (inqRes.data?.inquiries       || []) : [];
        const agts  = agentsRes.success   ? (agentsRes.data?.agents       || []) : [];
        const svcs  = servicesRes.success ? (servicesRes.data?.services   || []) : [];

        setPropList(props);
        setAgentList(agts);
        setServiceList(svcs);

        const anns = annRes.success
          ? (Array.isArray(annRes.data) ? annRes.data : (annRes.data?.announcements || []))
          : [];
        setAnnList(anns);

        if (ownerViewsRes.success) setOwnerOutreach(ownerViewsRes.data || {});
        if (aiRes.success)         setAiStats(aiRes.data || {});
        if (trendRes.success)      setTrendData(trendRes.data?.trend || []);

        const inqsThisMonth = inqs.filter(i => isThisMonth(i.createdAt)).length;

        setRecentRegistrations(
          [
            ...props.map(p => ({
              type: 'property',
              id: p.id,
              name: p.title || p.address || 'Property',
              date: p.createdAt,
              status: p.status,
            })),
            ...inqs.map(i => ({
              type: 'inquiry',
              id: i.id,
              name: i.name || i.clientName || i.propertyTitle || 'Inquiry',
              date: i.createdAt,
              status: i.status,
            })),
          ]
            .filter(r => r.date)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10)
        );

        setStats({
          totalProperties: propsRes.success ? (propsRes.data?.pagination?.total ?? props.length) : 0,
          newThisWeek:     props.filter(p => isThisWeek(p.createdAt)).length,
          forSale:         props.filter(p => p.listingType === 'sale').length,
          forRent:         props.filter(p => p.listingType === 'rent').length,
          forShortLet:     props.filter(p => p.listingType === 'short_let' || p.listingType === 'lease').length,
          available:       props.filter(p => p.status === 'available').length,
          underOffer:      props.filter(p => p.status === 'under_offer').length,
          sold:            props.filter(p => p.status === 'sold').length,
          rented:          props.filter(p => p.status === 'rented').length,

          totalInquiries:  inqRes.success ? (inqRes.data?.pagination?.total ?? inqs.length) : 0,
          newToday:        inqs.filter(i => isToday(i.createdAt)).length,
          openInquiries:   inqs.filter(i => OPEN_INQUIRY_STATUSES.includes(i.status)).length,
          resolvedMonth:   inqs.filter(i => i.status === 'resolved' && isThisMonth(i.updatedAt || i.createdAt)).length,
          inqsThisMonth,

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
        targetType: activeChannel,
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
  const safeAgentCount   = Math.max(stats.totalAgents || agentList.length, 1);
  const avgPropsPerAgent = (stats.totalProperties / safeAgentCount).toFixed(1);
  const avgInqPerAgent   = (stats.totalInquiries  / safeAgentCount).toFixed(1);

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
            <StatCard icon={Building2}   label="Total Properties" value={stats.totalProperties} linkTo="/properties" accent={E_DARK} />
            <StatCard icon={TrendingUp}  label="New This Week"    value={stats.newThisWeek}      linkTo="/properties" accent={E_MID}  />
            <StatCard icon={CheckCircle} label="Available"        value={stats.available}         linkTo="/properties" accent={E_MID}  />
            <StatCard icon={Handshake}   label="Under Offer"      value={stats.underOffer}        linkTo="/properties" accent={GOLD}   />
          </div>
          <div className="dash-cards-row">
            <StatCard icon={Tag}   label="For Sale"  value={stats.forSale}     linkTo="/properties" accent={GOLD}  />
            <StatCard icon={Home}  label="For Rent"  value={stats.forRent}     linkTo="/properties" accent={GOLD2} />
            <StatCard icon={Waves} label="Short Let" value={stats.forShortLet} linkTo="/properties" accent={E_MID} />
          </div>
        </section>

        {/* ── ROW 2: DEALS & REVENUE ────────────────────────── */}
        <section className="dash-section">
          <SectionHeading icon={DollarSign} title="Deals & Revenue" linkTo="/properties" />
          <div className="dash-cards-row">
            <StatCard icon={CheckCircle2} label="Sales Closed"  value={soldProps.length}     linkTo="/properties" accent="#c0392b" sub={fmtEur(salesRevenue)} />
            <StatCard icon={Home}         label="Long Lets"      value={longLetProps.length}  linkTo="/properties" accent="#2980b9" sub={fmtEur(longLetRevenue)} />
            <StatCard icon={Waves}        label="Short Lets"     value={shortLetProps.length} linkTo="/properties" accent={GOLD}    sub={fmtEur(shortLetRevenue)} />
            <StatCard icon={Euro}         label="Total Revenue"  value={fmtEur(totalRevenue)} linkTo="/properties" accent={E_MID}  />
          </div>
          <div className="dash-cards-row dash-cards-row--narrow">
            <StatCard icon={BarChart2} label="Deals This Month" value={dealsThisMonth} linkTo="/properties" accent={GOLD2} />
          </div>
        </section>

        {/* ── REGISTRATIONS ────────────────────────────────── */}
        <section className="dash-section">
          <SectionHeading icon={ClipboardCheck} title="Registrations" linkTo="/properties" />
          <div className="dash-cards-row">
            <StatCard icon={Building2}     label="Properties This Month" value={propList.filter(p => isThisMonth(p.createdAt)).length} linkTo="/properties" accent={E_DARK} />
            <StatCard icon={MessageSquare} label="Inquiries This Month"  value={stats.inqsThisMonth}                                   linkTo="/inquiries"  accent={GOLD}   />
            <StatCard icon={Users}         label="Total Owners"           value={stats.totalOwners}                                     linkTo="/owners"     accent={E_MID}  sub="All time" />
            <StatCard icon={Handshake}     label="Deals This Month"       value={dealsThisMonth}                                        linkTo="/properties" accent={GOLD2}  />
            <StatCard icon={UserCheck}     label="Active Agents"          value={activeAgents}                                          linkTo="/agents"     accent={E_MID}  />
            <StatCard icon={UserCheck}     label="Owner Contacts / Month" value={ownerOutreach.thisMonth}                               linkTo="/owners"     accent={GOLD}   />
          </div>
          {recentRegistrations.length > 0 && (
            <div className="dash-reg-list">
              {recentRegistrations.map((r, idx) => (
                <div key={r.id || idx} className="dash-reg-item">
                  {r.type === 'property'
                    ? <Building2 size={15} color={E_MID} strokeWidth={1.75} />
                    : <MessageSquare size={15} color={GOLD} strokeWidth={1.75} />}
                  <span className={`dash-reg-type-badge dash-reg-type-badge--${r.type}`}>{r.type}</span>
                  <span className="dash-reg-name">{r.name}</span>
                  <span className="dash-reg-status">{r.status?.replace(/_/g, ' ')}</span>
                  <span className="dash-reg-date">
                    {r.date ? new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── ROW 3: INQUIRIES ─────────────────────────────── */}
        <section className="dash-section">
          <SectionHeading icon={MessageSquare} title="Inquiries" linkTo="/inquiries" />
          <div className="dash-cards-row">
            <StatCard icon={MessageSquare}  label="Total Inquiries"    value={stats.totalInquiries} linkTo="/inquiries"                accent={E_DARK} />
            <StatCard icon={Bell}           label="New Today"           value={stats.newToday}       linkTo="/inquiries"                accent={GOLD}   />
            <StatCard icon={Home}           label="Open Inquiries"      value={stats.openInquiries}  linkTo="/inquiries"                accent={E_MID}  />
            <StatCard icon={ClipboardCheck} label="Resolved This Month" value={stats.resolvedMonth}  linkTo="/inquiries?status=resolved" accent={GOLD2} />
          </div>
        </section>

        {/* ── ROW 4: OWNER OUTREACH ─────────────────────────── */}
        <section className="dash-section">
          <SectionHeading icon={Users} title="Owner Outreach" linkTo="/owners" />
          <div className="dash-cards-row">
            <StatCard icon={UserCheck} label="Agent-Viewed Contacts" value={ownerOutreach.total}    linkTo="/owners" accent={E_MID}  />
            <StatCard icon={UserCheck} label="Contacts This Month"   value={ownerOutreach.thisMonth} linkTo="/owners" accent={GOLD}   />
            <StatCard icon={Bot}       label="AI Automated Contacts" value={aiStats.totalAI}         linkTo="/owners" accent="#8e44ad" />
            <StatCard icon={Activity}  label="Agent-Initiated Comms" value={aiStats.totalAgent}      linkTo="/owners" accent={GOLD2}  />
          </div>
        </section>

        {/* ── ROW 5: AGENT PERFORMANCE ─────────────────────── */}
        <section className="dash-section">
          <SectionHeading icon={UserCheck} title="Agent Performance" linkTo="/agents" />
          <div className="dash-cards-row">
            <StatCard icon={UserCheck}     label="Total Agents"          value={stats.totalAgents}        linkTo="/agents" accent={E_DARK} />
            <StatCard icon={Activity}      label="Active Agents"         value={activeAgents}              linkTo="/agents" accent={E_MID}  />
            <StatCard icon={Target}        label="Avg Props / Agent"     value={avgPropsPerAgent}          linkTo="/agents" accent={GOLD}   />
            <StatCard icon={MessageSquare} label="Avg Inquiries / Agent" value={avgInqPerAgent}            linkTo="/agents" accent={GOLD2}  />
            <StatCard icon={Award}         label="Top Performer"         value={topPerformer?.name || '—'} linkTo="/agents" accent={E_MID} sub={topPerformer ? `${topPerformer.count} properties` : undefined} />
          </div>
        </section>

        {/* ── ROW 6: OWNERS, BRANCHES ──────────────────────── */}
        <section className="dash-section">
          <div className="dash-cards-row dash-cards-row--narrow">
            <StatCard icon={Users}     label="Total Owners"   value={stats.totalOwners}   linkTo="/owners"   accent={E_MID} />
            <StatCard icon={GitBranch} label="Total Branches" value={stats.totalBranches} linkTo="/branches" accent={GOLD}  />
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
            </div>
            <div className="dash-chart-card">
              <h3 className="dash-chart-title">Deals by Type</h3>
              <DealsBar propList={propList} />
            </div>
            <div className="dash-chart-card">
              <h3 className="dash-chart-title">Owner Outreach — Agent vs AI</h3>
              <OutreachDonut agentViews={ownerOutreach.total} aiContacts={aiStats.totalAI} />
            </div>
            <div className="dash-chart-card">
              <h3 className="dash-chart-title">Registrations This Month</h3>
              <RegistrationsChart propList={propList} inqCount={stats.inqsThisMonth} agentList={agentList} />
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer className="dash-footer">
          <span className="dash-footer-brand">Golden Key Realty</span>
          <span className="dash-footer-sep">·</span>
          <span className="dash-footer-copy">© {new Date().getFullYear()} All rights reserved</span>
        </footer>
      </div>

      {/* ── CHAT SIDEBAR ─────────────────────────────────── */}
      <aside className={`dash-chat-sidebar${sidebarMinimized ? ' dash-chat-sidebar--minimized' : ''}`}>
        <div className="chat-sidebar-header">
          <span className="chat-sidebar-title">
            <Megaphone size={15} strokeWidth={1.75} />
            Channels
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
            <div className="chat-channel-tabs">
              {visibleChannels.map(ch => {
                const ChIcon = ch.icon;
                return (
                  <button
                    key={ch.id}
                    className={`chat-channel-tab${activeChannel === ch.id ? ' chat-channel-tab--active' : ''}`}
                    onClick={() => setActiveChannel(ch.id)}
                    title={ch.label}
                  >
                    <ChIcon size={11} strokeWidth={2} />
                    {ch.label}
                  </button>
                );
              })}
            </div>

            <div className="chat-list" ref={chatListRef}>
              {activeChannelAnnList.length === 0 ? (
                <div className="chat-empty">
                  <Megaphone size={28} strokeWidth={1.25} style={{ color: 'rgba(212,175,55,0.4)' }} />
                  <p>No messages in this channel yet.</p>
                </div>
              ) : (
                [...activeChannelAnnList].reverse().map(ann => (
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
            <span>📢 Channels</span>
            <button onClick={() => setMobileSidebarOpen(false)} className="chat-sidebar-toggle">
              <X size={16} />
            </button>
          </div>
          <div className="chat-channel-tabs">
            {visibleChannels.map(ch => {
              const ChIcon = ch.icon;
              return (
                <button
                  key={ch.id}
                  className={`chat-channel-tab${activeChannel === ch.id ? ' chat-channel-tab--active' : ''}`}
                  onClick={() => setActiveChannel(ch.id)}
                  title={ch.label}
                >
                  <ChIcon size={11} strokeWidth={2} />
                  {ch.label}
                </button>
              );
            })}
          </div>
          <div className="chat-list chat-list--mobile" ref={chatListRef}>
            {activeChannelAnnList.length === 0 ? (
              <div className="chat-empty"><p>No messages in this channel yet.</p></div>
            ) : (
              [...activeChannelAnnList].reverse().map(ann => (
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

