import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Users, UserCheck, MessageSquare, X } from 'lucide-react';
import { properties, owners, agents, inquiries } from '../services/api';
import './GlobalSearch.css';

const CATEGORY_CONFIG = {
  properties: { label: 'Properties', icon: Building2, path: '/properties' },
  owners: { label: 'Owners', icon: Users, path: '/owners' },
  agents: { label: 'Agents', icon: UserCheck, path: '/agents' },
  inquiries: { label: 'Inquiries', icon: MessageSquare, path: '/inquiries' },
};

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Open on Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const search = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults({});
      return;
    }
    setLoading(true);
    try {
      const [propsRes, ownersRes, agentsRes, inqRes] = await Promise.all([
        properties.getAll({ search: q, limit: 4 }),
        owners.getAll({ search: q, limit: 4 }),
        agents.getAll({ search: q, limit: 4 }),
        inquiries.getAll({ search: q, limit: 4 }),
      ]);
      setResults({
        properties: propsRes.success ? propsRes.data.properties : [],
        owners: ownersRes.success ? ownersRes.data.owners : [],
        agents: agentsRes.success ? agentsRes.data.agents : [],
        inquiries: inqRes.success ? inqRes.data.inquiries : [],
      });
    } catch {
      setResults({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (path) => {
    navigate(path);
    setOpen(false);
    setQuery('');
    setResults({});
  };

  const hasResults = Object.values(results).some(arr => arr && arr.length > 0);

  function getItemLabel(category, item) {
    if (category === 'properties') return `${item.title} — €${Number(item.price).toLocaleString()}`;
    if (category === 'owners') return `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email;
    if (category === 'agents') {
      const name = item.user ? `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim() : '';
      return name || item.user?.email || 'Agent';
    }
    if (category === 'inquiries') return `${item.name || 'Inquiry'} — ${item.propertyTitle || item.subject || ''}`;
    return String(item.id);
  }

  if (!open) {
    return (
      <button
        className="global-search-trigger"
        onClick={() => setOpen(true)}
        title="Global Search (Ctrl+K)"
      >
        <Search size={15} strokeWidth={1.75} />
        <span>Search…</span>
        <kbd>{navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}</kbd>
      </button>
    );
  }

  return (
    <div className="global-search-overlay" onClick={() => { setOpen(false); setQuery(''); }}>
      <div className="global-search-modal" onClick={e => e.stopPropagation()}>
        <div className="global-search-input-row">
          <Search size={18} strokeWidth={1.75} className="global-search-icon" />
          <input
            ref={inputRef}
            className="global-search-input"
            type="text"
            placeholder="Search properties, owners, agents, inquiries…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className="global-search-clear" onClick={() => setQuery('')}>
              <X size={15} />
            </button>
          )}
        </div>

        {loading && <div className="global-search-loading">Searching…</div>}

        {!loading && query.length >= 2 && !hasResults && (
          <div className="global-search-empty">No results for "{query}"</div>
        )}

        {!loading && hasResults && (
          <div className="global-search-results">
            {Object.entries(results).map(([category, items]) => {
              if (!items || items.length === 0) return null;
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              return (
                <div key={category} className="global-search-group">
                  <div className="global-search-group-label">
                    <Icon size={13} strokeWidth={2} /> {config.label}
                  </div>
                  {items.map(item => (
                    <button
                      key={item.id}
                      className="global-search-item"
                      onClick={() => handleSelect(config.path)}
                    >
                      <span className="global-search-item-text">{getItemLabel(category, item)}</span>
                      <span className="global-search-item-arrow">→</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {!query && (
          <div className="global-search-hint">
            Type at least 2 characters to search across all records. Press <kbd>Esc</kbd> to close.
          </div>
        )}
      </div>
    </div>
  );
}

export default GlobalSearch;
