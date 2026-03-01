import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { listings } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { CurrencyProvider, useCurrency } from '../contexts/CurrencyContext';
import AIChatbot from '../components/AIChatbot';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import './ListingsPage.css';

// Fix leaflet default marker icons in Vite builds
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ---- CONSTANTS ----

const PROPERTY_TYPES = [
  'apartment', 'house', 'villa', 'townhouse', 'penthouse',
  'maisonette', 'farmhouse', 'commercial', 'office', 'land', 'garage', 'other'
];

const DEMAND_AREAS = [
  { area: 'Sliema',       demand: 'Very High', lat: 35.9122, lng: 14.5017, priceRange: '€3,500 – €6,000 /m²' },
  { area: "St. Julian's", demand: 'Very High', lat: 35.9179, lng: 14.4895, priceRange: '€3,200 – €5,800 /m²' },
  { area: 'Valletta',     demand: 'High',      lat: 35.8997, lng: 14.5147, priceRange: '€2,800 – €5,000 /m²' },
  { area: 'Msida',        demand: 'High',      lat: 35.9010, lng: 14.4844, priceRange: '€2,200 – €3,800 /m²' },
  { area: 'Swieqi',       demand: 'High',      lat: 35.9266, lng: 14.4845, priceRange: '€2,500 – €4,200 /m²' },
  { area: 'Naxxar',       demand: 'Medium',    lat: 35.9245, lng: 14.4309, priceRange: '€1,800 – €3,200 /m²' },
  { area: 'Mosta',        demand: 'Medium',    lat: 35.9087, lng: 14.4264, priceRange: '€1,600 – €2,800 /m²' },
  { area: 'Rabat',        demand: 'Medium',    lat: 35.8811, lng: 14.3993, priceRange: '€1,500 – €2,600 /m²' },
  { area: 'Marsaskala',   demand: 'Low',       lat: 35.8632, lng: 14.5567, priceRange: '€1,200 – €2,200 /m²' },
  { area: 'Marsaxlokk',   demand: 'Low',       lat: 35.8418, lng: 14.5435, priceRange: '€1,000 – €1,900 /m²' },
];

const DEMAND_COLORS = {
  'Very High': '#EF4444',
  'High':      '#F97316',
  'Medium':    '#EAB308',
  'Low':       '#22C55E',
};

const DEMAND_ICONS = { 'Very High': '🔴', 'High': '🟠', 'Medium': '🟡', 'Low': '🟢' };

const CITY_DEMAND = {
  'Sliema': 'Very High', "St. Julian's": 'Very High',
  'Valletta': 'High', 'Msida': 'High', 'Swieqi': 'High',
  'Naxxar': 'Medium', 'Mosta': 'Medium', 'Rabat': 'Medium',
};

const CITY_COORDS = {
  'Sliema': [35.9122, 14.5017], "St. Julian's": [35.9179, 14.4895],
  'Valletta': [35.8997, 14.5147], 'Msida': [35.9010, 14.4844],
  'Swieqi': [35.9266, 14.4845], 'Naxxar': [35.9245, 14.4309],
  'Mosta': [35.9087, 14.4264], 'Rabat': [35.8811, 14.3993],
  'Marsaskala': [35.8632, 14.5567], 'Marsaxlokk': [35.8418, 14.5435],
  'Mellieħa': [35.9591, 14.3630], 'Mellieha': [35.9591, 14.3630], // both spellings used in property data
  'Bugibba': [35.9544, 14.4167], "St. Paul's Bay": [35.9544, 14.3917],
  'Birkirkara': [35.8952, 14.4596], 'Gzira': [35.9048, 14.4966],
  'Balzan': [35.8980, 14.4466], 'Attard': [35.8900, 14.4299],
  'Fgura': [35.8744, 14.5118], 'Zejtun': [35.8572, 14.5324],
  'Vittoriosa': [35.8888, 14.5236], 'Mdina': [35.8864, 14.4015],
  'Malta': [35.9375, 14.3754], '_default': [35.9375, 14.3754],
};

const SERVICE_TABS = [
  { id: 'boat-tours', label: '🚤 Boat Tours',   emoji: '🚤', category: 'boat_tour',   title: 'Boat Tours'   },
  { id: 'rent-car',   label: '🚗 Rent a Car',   emoji: '🚗', category: 'car_rental',  title: 'Car Rentals'  },
  { id: 'rent-bike',  label: '🚲 Rent a Bike',  emoji: '🚲', category: 'bike_rental', title: 'Bike Rentals' },
  { id: 'book-tour',  label: '🗺️ Book a Tour',  emoji: '🗺️', category: 'guided_tour', title: 'Guided Tours' },
];

const i18n = {
  EN: {
    hero_title: 'Find Your Perfect Property in Malta',
    hero_sub: 'Browse premium properties for sale and rent across the Maltese islands',
    search_placeholder: '🔍  Search by title, address, city…',
    tab_sale: '🏠 For Sale', tab_long_let: '📅 Long Let', tab_short_let: '🏖️ Short Let',
    tab_calculators: '🧮 Calculators', tab_demand_map: '📊 Demand Map',
    tab_property_map: '🗺️ Property Map', tab_saved: '❤️ Saved',
    btn_list_property: 'List Your Property', btn_affiliate: 'Become an Affiliate', btn_join_team: 'Join Our Team',
    filter_property_type: 'Property Type', filter_min_price: 'Min Price (€)',
    filter_max_price: 'Max Price (€)', filter_bedrooms: 'Bedrooms',
    search_btn: 'Search Properties', clear_filters: 'Clear all',
    wa_msg: (title, price, city) => `Hi, I'm interested in: ${title} - ${price} (${city}). Please provide more details.`,
  },
  MT: {
    hero_title: "Sib il-Proprjetà Perfetta Tiegħek f'Malta",
    hero_sub: 'Esplora proprjetajiet premium fl-Gżejjer Maltin',
    search_placeholder: '🔍  Fittex titlu, indirizz, belt…',
    tab_sale: '🏠 Għall-Bejgħ', tab_long_let: '📅 Kiri Twil', tab_short_let: '🏖️ Kiri Qasir',
    tab_calculators: '🧮 Kalkulaturi', tab_demand_map: '📊 Mappa tad-Domanda',
    tab_property_map: '🗺️ Mappa tal-Proprjetajiet', tab_saved: '❤️ Salvat',
    btn_list_property: 'Inkludi l-Proprjetà Tiegħek', btn_affiliate: 'Issieħeb bħala Affiliat', btn_join_team: 'Ingħaqad mal-Frik',
    filter_property_type: "Tip ta' Proprjetà", filter_min_price: 'Prezz Minimu (€)',
    filter_max_price: 'Prezz Massimu (€)', filter_bedrooms: 'Kmamar tas-Sodda',
    search_btn: 'Ifittex Proprjetajiet', clear_filters: 'Ħassar kollox',
    wa_msg: (title, price, city) => `Bongu, qed ninteressa ruħi fi: ${title} - ${price} (${city}). Jekk jogħġbok agħtini iktar dettalji.`,
  },
  IT: {
    hero_title: 'Trova la Tua Proprietà Ideale a Malta',
    hero_sub: 'Sfoglia proprietà premium nelle isole maltesi',
    search_placeholder: '🔍  Cerca per titolo, indirizzo, città…',
    tab_sale: '🏠 In Vendita', tab_long_let: '📅 Affitto Lungo', tab_short_let: '🏖️ Affitto Breve',
    tab_calculators: '🧮 Calcolatori', tab_demand_map: '📊 Mappa Domanda',
    tab_property_map: '🗺️ Mappa Proprietà', tab_saved: '❤️ Salvati',
    btn_list_property: 'Pubblica Proprietà', btn_affiliate: 'Diventa Affiliato', btn_join_team: 'Unisciti al Team',
    filter_property_type: 'Tipo Proprietà', filter_min_price: 'Prezzo Min (€)',
    filter_max_price: 'Prezzo Max (€)', filter_bedrooms: 'Camere da Letto',
    search_btn: 'Cerca Proprietà', clear_filters: 'Cancella tutto',
    wa_msg: (title, price, city) => `Ciao, sono interessato a: ${title} - ${price} (${city}). Per favore forniscimi ulteriori dettagli.`,
  },
};

// ---- HELPERS ----

function getPropertyCoords(p) {
  if (p.latitude && p.longitude) return [parseFloat(p.latitude), parseFloat(p.longitude)];
  const city = p.city || 'Malta';
  return CITY_COORDS[city] || CITY_COORDS['_default'];
}

function getPropertyMarkerColor(p) {
  const demand = CITY_DEMAND[p.city || ''];
  if (!demand) return '#3B82F6';
  return DEMAND_COLORS[demand];
}

function timeSince(dateStr) {
  if (!dateStr) return null;
  const diff = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ---- MODAL FORM ----

const defaultForm = {
  name: '', email: '', phone: '', message: '',
  viewingDate: '', viewingTime: '', numberOfPeople: 1, hasPets: '',
  numberOfAdults: '', numberOfChildren: '', childrenAges: '',
  nationality: '', gender: '', relationshipStatus: '', budgetRange: '',
  hearAboutUs: '', countryOfResidence: '',
};

function ModalForm({ title, subtitle, onClose, propertyId, source, listingType }) {
  const [form, setForm] = useState(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [optionalOpen, setOptionalOpen] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');
    try {
      const body = {
        clientName: form.name,
        clientEmail: form.email,
        message: form.message,
        source: source || 'website',
        status: 'new',
        preferredViewingDate: form.viewingDate || undefined,
        preferredViewingTime: form.viewingTime || undefined,
        numberOfPeople: form.numberOfPeople,
        hasPets: form.hasPets,
        numberOfAdults: form.numberOfAdults || undefined,
        numberOfChildren: form.numberOfChildren || undefined,
        childrenAges: form.childrenAges || undefined,
        nationality: form.nationality || undefined,
        gender: form.gender || undefined,
        relationshipStatus: form.relationshipStatus || undefined,
        budgetRange: form.budgetRange || undefined,
        hearAboutUs: form.hearAboutUs || undefined,
        countryOfResidence: form.countryOfResidence || undefined,
      };
      if (form.phone) body.clientPhone = form.phone;
      if (propertyId) body.propertyId = propertyId;
      const res = await fetch('/api/inquiries/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setSubmitError(data.message || 'Failed to send. Please try again.');
      }
    } catch {
      setSubmitError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isRent = listingType === 'rent';
  const budgetOptions = isRent
    ? ['Under €500/mo', '€500–1000/mo', '€1000–2000/mo', '€2000+/mo']
    : ['Under €200k', '€200k–500k', '€500k–1m', '€1m+'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="modal-title">{title}</h2>
        {subtitle && <p className="modal-subtitle">{subtitle}</p>}
        {submitted ? (
          <div className="modal-success">
            <div className="modal-success-icon">✅</div>
            <h3>Thank You!</h3>
            <p>We've received your message and will be in touch soon.</p>
            <button className="btn-gold" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            {submitError && <div style={{ color: 'var(--error, #ef4444)', marginBottom: 8, fontSize: 14 }}>{submitError}</div>}

            {/* Required section */}
            <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 8, padding: '12px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Required Information</div>
              <input required placeholder="Full Name *" value={form.name} onChange={set('name')} />
              <input required type="email" placeholder="Email Address *" value={form.email} onChange={set('email')} />
              <input required type="tel" placeholder="Phone Number *" value={form.phone} onChange={set('phone')} />
              <textarea required placeholder="Your message… *" rows={3} value={form.message} onChange={set('message')} />
              <label style={{ fontSize: 12, color: '#ccc', display: 'block', marginBottom: 4 }}>Preferred Viewing Date *</label>
              <input required type="date" value={form.viewingDate} onChange={set('viewingDate')} />
              <label style={{ fontSize: 12, color: '#ccc', display: 'block', marginBottom: 4 }}>Preferred Viewing Time *</label>
              <select required value={form.viewingTime} onChange={set('viewingTime')}>
                <option value="">Select time…</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
              <label style={{ fontSize: 12, color: '#ccc', display: 'block', marginBottom: 4 }}>Number of People for Viewing *</label>
              <input required type="number" min="1" placeholder="Number of people *" value={form.numberOfPeople} onChange={set('numberOfPeople')} />
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 12, color: '#ccc', display: 'block', marginBottom: 4 }}>Do You Have Pets? *</label>
                <label style={{ marginRight: 16, fontSize: 14 }}>
                  <input required type="radio" name="hasPets" value="yes" checked={form.hasPets === 'yes'} onChange={set('hasPets')} style={{ width: 'auto', marginRight: 4 }} /> Yes
                </label>
                <label style={{ fontSize: 14 }}>
                  <input required type="radio" name="hasPets" value="no" checked={form.hasPets === 'no'} onChange={set('hasPets')} style={{ width: 'auto', marginRight: 4 }} /> No
                </label>
              </div>
            </div>

            {/* Optional section */}
            <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setOptionalOpen(o => !o)}
                style={{ width: '100%', background: 'none', border: 'none', color: '#ccc', padding: '10px 12px', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Optional Details</span>
                <span>{optionalOpen ? '▲' : '▼'}</span>
              </button>
              {optionalOpen && (
                <div style={{ padding: '0 12px 12px' }}>
                  <label style={{ fontSize: 12, color: '#aaa' }}>Number of Adults (Optional)</label>
                  <input type="number" min="0" placeholder="Adults" value={form.numberOfAdults} onChange={set('numberOfAdults')} />
                  <label style={{ fontSize: 12, color: '#aaa' }}>Number of Children (Optional)</label>
                  <input type="number" min="0" placeholder="Children" value={form.numberOfChildren} onChange={set('numberOfChildren')} />
                  {Number(form.numberOfChildren) > 0 && (
                    <>
                      <label style={{ fontSize: 12, color: '#aaa' }}>Children Ages (Optional)</label>
                      <input type="text" placeholder="e.g. 3, 7, 12" value={form.childrenAges} onChange={set('childrenAges')} />
                    </>
                  )}
                  <label style={{ fontSize: 12, color: '#aaa' }}>Nationality (Optional)</label>
                  <input type="text" placeholder="Nationality" value={form.nationality} onChange={set('nationality')} />
                  <label style={{ fontSize: 12, color: '#aaa' }}>Gender (Optional)</label>
                  <select value={form.gender} onChange={set('gender')}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <label style={{ fontSize: 12, color: '#aaa' }}>Relationship Status (Optional)</label>
                  <select value={form.relationshipStatus} onChange={set('relationshipStatus')}>
                    <option value="">Prefer not to say</option>
                    <option value="single">Single</option>
                    <option value="couple">Couple</option>
                    <option value="family">Family</option>
                    <option value="friends">Friends</option>
                  </select>
                  <label style={{ fontSize: 12, color: '#aaa' }}>Budget Range (Optional)</label>
                  <select value={form.budgetRange} onChange={set('budgetRange')}>
                    <option value="">Select range…</option>
                    {budgetOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <label style={{ fontSize: 12, color: '#aaa' }}>How Did You Hear About Us? (Optional)</label>
                  <select value={form.hearAboutUs} onChange={set('hearAboutUs')}>
                    <option value="">Select…</option>
                    <option value="google">Google</option>
                    <option value="social_media">Social Media</option>
                    <option value="friend">Friend</option>
                    <option value="agent">Agent</option>
                    <option value="other">Other</option>
                  </select>
                  <label style={{ fontSize: 12, color: '#aaa' }}>Current Country of Residence (Optional)</label>
                  <input type="text" placeholder="Country of Residence" value={form.countryOfResidence} onChange={set('countryOfResidence')} />
                </div>
              )}
            </div>

            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ---- LISTING CARD ----

function ListingCard({ p, onContactAgent, favorites, onToggleFavorite, t }) {
  const [imgError, setImgError] = useState(false);
  const { formatPrice } = useCurrency();
  const hasImage = p.images && p.images.length > 0 && !imgError;
  const isFavorite = favorites.includes(p.id);

  const agentName = p.agent?.user
    ? `${p.agent.user.firstName || ''} ${p.agent.user.lastName || ''}`.trim()
    : p.agent ? 'Agent' : null;
  const agentPhone = p.agent?.mobile || p.agent?.phone;
  const agentEmail = p.agent?.user?.email;
  const agentPhoto = p.agent?.profileImageUrl;
  const agentInitials = getInitials(agentName);

  const waMsg = t?.wa_msg
    ? t.wa_msg(p.title, formatPrice(p.price), p.city || 'Malta')
    : `Hi, I'm interested in: ${p.title} - ${formatPrice(p.price)} (${p.city || 'Malta'}). Please provide more details.`;
  const waUrl = agentPhone
    ? `https://wa.me/${agentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`
    : null;

  const rentalLabel = p.rentalType === 'short_let' ? 'Short Let' : p.rentalType === 'long_let' ? 'Long Let' : null;
  const lastUpdated = timeSince(p.updatedAt || p.createdAt);

  return (
    <div className="listing-card">
      <div className="listing-img">
        {hasImage ? (
          <img src={p.images[0]} alt={p.title} onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className="listing-img-placeholder">🏠</div>
        )}
        <span className={`listing-badge listing-badge-${p.listingType}`}>
          {p.listingType === 'sale' ? 'For Sale' : p.listingType === 'rent' ? 'For Rent' : 'For Lease'}
        </span>
        {rentalLabel && <span className="listing-badge-rental">{rentalLabel}</span>}
        <button
          className={`listing-fav-btn${isFavorite ? ' active' : ''}`}
          onClick={() => onToggleFavorite(p.id)}
          title={isFavorite ? 'Remove from saved' : 'Save property'}
          aria-label="Toggle favorite"
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="listing-body">
        <div className="listing-price">
          {formatPrice(p.price)}
          {p.listingType === 'rent' && <span className="price-period">/mo</span>}
        </div>
        <h3 className="listing-title">{p.title}</h3>
        <div className="listing-location">📍 {p.city || p.address || 'Malta'}</div>

        <div className="listing-features">
          {p.bedrooms  ? <span>🛏 {p.bedrooms} bed</span>  : null}
          {p.bathrooms ? <span>🚿 {p.bathrooms} bath</span> : null}
          {p.squareMeters ? <span>📐 {p.squareMeters} m²</span> : null}
          <span style={{ textTransform: 'capitalize' }}>🏷 {p.propertyType}</span>
        </div>

        {p.availableFrom && (
          <div className="listing-available">
            📅 Available from {new Date(p.availableFrom).toLocaleDateString('en-MT', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}

        {p.description && (
          <p className="listing-desc">{p.description.slice(0, 100)}{p.description.length > 100 ? '…' : ''}</p>
        )}

        {agentName && (
          <div className="listing-agent">
            <div className="listing-agent-row">
              {agentPhoto ? (
                <img src={agentPhoto} alt={agentName} className="listing-agent-avatar" />
              ) : (
                <div className="listing-agent-avatar listing-agent-initials">{agentInitials}</div>
              )}
              <div className="listing-agent-info">
                <span className="listing-agent-name">👔 {agentName}</span>
                {agentPhone && <a href={`tel:${agentPhone}`} className="listing-agent-phone">📞 {agentPhone}</a>}
                {agentEmail && <a href={`mailto:${agentEmail}`} className="listing-agent-email">✉️ {agentEmail}</a>}
              </div>
            </div>
            <div className="listing-card-actions">
              <button className="listing-contact-btn" onClick={() => onContactAgent(p)}>
                💬 Contact Agent
              </button>
              {waUrl && (
                <a href={waUrl} className="listing-whatsapp-btn" target="_blank" rel="noopener noreferrer">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        )}

        {lastUpdated && <div className="listing-updated">🕐 Updated {lastUpdated}</div>}
      </div>
    </div>
  );
}

// ---- DEMAND MAP TAB ----

function DemandMapTab() {
  const [activeFilter, setActiveFilter] = useState('All');
  const { theme } = useTheme();
  const filters = ['All', 'Very High', 'High', 'Medium', 'Low'];
  const filtered = activeFilter === 'All' ? DEMAND_AREAS : DEMAND_AREAS.filter(a => a.demand === activeFilter);
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <section className="demand-section">
      <div className="demand-header">
        <h2>Malta Property Demand Map</h2>
        <p>See which areas have the highest demand and expected price ranges per m²</p>
        <div className="demand-filters">
          {filters.map(f => (
            <button key={f} className={`demand-filter-btn${activeFilter === f ? ' active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="demand-map-container">
        <MapContainer center={[35.9100, 14.4600]} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={tileUrl}
          />
          {DEMAND_AREAS.map(area => (
            <CircleMarker
              key={area.area}
              center={[area.lat, area.lng]}
              radius={18}
              pathOptions={{ color: DEMAND_COLORS[area.demand], fillColor: DEMAND_COLORS[area.demand], fillOpacity: 0.7, weight: 2 }}
            >
              <Popup>
                <div style={{ minWidth: 150 }}>
                  <strong style={{ fontSize: 15 }}>{area.area}</strong>
                  <div style={{ color: DEMAND_COLORS[area.demand], fontWeight: 700, margin: '4px 0' }}>{area.demand} Demand</div>
                  <div style={{ fontSize: 13, color: '#555' }}>{area.priceRange}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="demand-legend">
        {Object.entries(DEMAND_COLORS).map(([level, color]) => (
          <span key={level} className="demand-legend-item">
            <span className="demand-legend-dot" style={{ background: color }} />
            {level} Demand
          </span>
        ))}
      </div>

      <div className="demand-grid">
        {filtered.map(area => (
          <div key={area.area} className={`demand-card demand-${area.demand.toLowerCase().replace(' ', '-')}`}>
            <div className="demand-card-icon">{DEMAND_ICONS[area.demand]}</div>
            <div className="demand-card-info">
              <div className="demand-area-name">{area.area}</div>
              <div className="demand-level">{area.demand} Demand</div>
              <div className="demand-price">{area.priceRange}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="demand-note">
        <div className="demand-note-icon">💡</div>
        <div>
          <strong>Investment Insight:</strong> High-demand areas offer strong rental yields and capital appreciation.
          Low-demand areas provide more affordable entry points with growth potential.
        </div>
      </div>
    </section>
  );
}

// ---- PROPERTY MAP TAB ----

function PropertyMapTab({ properties }) {
  const { theme } = useTheme();
  const { formatPrice } = useCurrency();
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="property-map-section">
      <h2>🗺️ Properties on Map</h2>
      <p className="property-map-sub">{properties.length} properties shown. Marker color indicates area demand.</p>
      <div className="demand-legend" style={{ marginBottom: 16 }}>
        {[
          ['#EF4444', "Very High (Sliema, St. Julian's)"],
          ['#F97316', 'High (Valletta, Msida, Swieqi)'],
          ['#EAB308', 'Medium (Naxxar, Mosta, Rabat)'],
          ['#3B82F6', 'Other areas'],
        ].map(([color, label]) => (
          <span key={label} className="demand-legend-item">
            <span className="demand-legend-dot" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
      <div className="listings-map-container">
        <MapContainer center={[35.9375, 14.3754]} zoom={11} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={tileUrl}
          />
          {properties.map(p => {
            const coords = getPropertyCoords(p);
            const color = getPropertyMarkerColor(p);
            return (
              <CircleMarker
                key={p.id}
                center={coords}
                radius={10}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: 2 }}
              >
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    {p.images && p.images.length > 0 && (
                      <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6, marginBottom: 6 }} />
                    )}
                    <strong style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>{p.title}</strong>
                    <span style={{ color: '#C4875A', fontWeight: 700 }}>{formatPrice(p.price)}</span>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{p.city || p.address}</div>
                    <div style={{ fontSize: 11, color: '#888', textTransform: 'capitalize' }}>{p.propertyType} · {p.listingType}</div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

// ---- SERVICE TAB ----

function buildServicePlaceholders(category, title, emoji) {
  return [
    { id: `ph-1-${category}`, title: `${emoji} ${title} – Explorer`, price: 50,  duration: '2 hours',  location: 'Valletta',      description: "Discover Malta's stunning coastline and history." },
    { id: `ph-2-${category}`, title: `${emoji} ${title} – Premium`,  price: 95,  duration: '4 hours',  location: 'Sliema',        description: 'Premium experience with a certified local guide.' },
    { id: `ph-3-${category}`, title: `${emoji} ${title} – Full Day`, price: 150, duration: 'Full day', location: "St. Julian's", description: 'Complete Malta experience — the ultimate package.' },
  ];
}

function ServiceTab({ category, title, emoji }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingService, setBookingService] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/services/public?category=${encodeURIComponent(category)}`)
      .then(r => r.json())
      .then(data => setServices(Array.isArray(data) ? data : (data.data || data.services || [])))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [category]);

  const displayServices = services.length > 0 ? services : buildServicePlaceholders(category, title, emoji);

  return (
    <div className="service-tab">
      <div className="service-tab-header">
        <h2>{emoji} {title}</h2>
        <p>Discover the best {title.toLowerCase()} services across Malta</p>
      </div>
      {loading && <div className="listings-spinner" />}
      <div className="service-grid">
        {displayServices.map(s => (
          <div key={s.id} className="service-card">
            <div className="service-card-img">
              {s.imageUrl
                ? <img src={s.imageUrl} alt={s.title || s.name} loading="lazy" />
                : <div className="service-card-emoji">{emoji}</div>}
            </div>
            <div className="service-card-body">
              <h3>{s.title || s.name}</h3>
              {s.price != null && (
                <div className="service-price">€{s.price}{s.priceUnit ? `/${s.priceUnit}` : ''}</div>
              )}
              <div className="service-meta">
                {s.duration  && <span>⏱ {s.duration}</span>}
                {s.location  && <span>📍 {s.location}</span>}
                {s.contactPhone && <span>📞 {s.contactPhone}</span>}
              </div>
              {s.description && <p className="service-desc">{s.description}</p>}
              <button className="btn-gold service-book-btn" onClick={() => setBookingService(s)}>
                📅 Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
      {bookingService && (
        <ModalForm
          title={`Book: ${bookingService.title || bookingService.name || title}`}
          subtitle="Fill in your details and we'll confirm your booking shortly."
          onClose={() => setBookingService(null)}
          source="website_service_booking"
        />
      )}
    </div>
  );
}

// ---- CALCULATORS TAB ----

function CalculatorsTab() {
  const [mortgage, setMortgage] = useState({ amount: 250000, rate: 3.5, term: 25 });
  const [invest, setInvest] = useState({ price: 250000, monthlyRent: 1200 });

  const calcMonthly = () => {
    const P = parseFloat(mortgage.amount) || 0;
    const r = (parseFloat(mortgage.rate) || 0) / 100 / 12;
    const n = (parseFloat(mortgage.term) || 0) * 12;
    if (!r || !n) return P / (n || 1);
    return P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const monthly = calcMonthly();
  const totalPaid = monthly * (parseFloat(mortgage.term) || 0) * 12;
  const totalInterest = totalPaid - (parseFloat(mortgage.amount) || 0);

  const annualRent = (parseFloat(invest.monthlyRent) || 0) * 12;
  const grossYield = invest.price > 0 ? (annualRent / parseFloat(invest.price)) * 100 : 0;

  return (
    <div className="calculators-tab">
      <div className="calc-grid">
        <div className="calc-card">
          <h3>🏦 Mortgage Calculator</h3>
          <p>Estimate your monthly repayments</p>
          <div className="calc-fields">
            <div className="calc-field">
              <label>Loan Amount (€)</label>
              <input type="number" value={mortgage.amount} onChange={e => setMortgage(m => ({ ...m, amount: e.target.value }))} />
            </div>
            <div className="calc-field">
              <label>Interest Rate (%)</label>
              <input type="number" step="0.1" value={mortgage.rate} onChange={e => setMortgage(m => ({ ...m, rate: e.target.value }))} />
            </div>
            <div className="calc-field">
              <label>Loan Term (years)</label>
              <input type="number" value={mortgage.term} onChange={e => setMortgage(m => ({ ...m, term: e.target.value }))} />
            </div>
          </div>
          <div className="calc-results">
            <div className="calc-result-main">
              <div className="calc-result-label">Monthly Payment</div>
              <div className="calc-result-value">€{monthly.toLocaleString('en-MT', { maximumFractionDigits: 0 })}</div>
            </div>
            <div className="calc-result-row"><span>Total Paid</span><span>€{totalPaid.toLocaleString('en-MT', { maximumFractionDigits: 0 })}</span></div>
            <div className="calc-result-row"><span>Total Interest</span><span>€{totalInterest.toLocaleString('en-MT', { maximumFractionDigits: 0 })}</span></div>
          </div>
        </div>

        <div className="calc-card">
          <h3>📈 Investment Calculator</h3>
          <p>Calculate gross rental yield</p>
          <div className="calc-fields">
            <div className="calc-field">
              <label>Property Price (€)</label>
              <input type="number" value={invest.price} onChange={e => setInvest(i => ({ ...i, price: e.target.value }))} />
            </div>
            <div className="calc-field">
              <label>Monthly Rental Income (€)</label>
              <input type="number" value={invest.monthlyRent} onChange={e => setInvest(i => ({ ...i, monthlyRent: e.target.value }))} />
            </div>
          </div>
          <div className="calc-results">
            <div className="calc-result-main">
              <div className="calc-result-label">Gross Yield</div>
              <div className="calc-result-value">{grossYield.toFixed(2)}%</div>
            </div>
            <div className="calc-result-row"><span>Annual Rental Income</span><span>€{annualRent.toLocaleString()}</span></div>
            <div className="calc-result-row"><span>Monthly Income</span><span>€{(parseFloat(invest.monthlyRent) || 0).toLocaleString()}</span></div>
          </div>
          <div className="calc-note">
            {grossYield >= 6 ? '🟢 Excellent yield (6%+)' : grossYield >= 4 ? '🟡 Good yield (4–6%)' : '🔴 Below average yield (<4%)'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- SAVED TAB ----

function SavedTab({ favorites, allProperties, onContactAgent, onToggleFavorite, t }) {
  const savedProps = allProperties.filter(p => favorites.includes(p.id));

  if (favorites.length === 0) {
    return (
      <div className="listings-empty">
        <div className="listings-empty-icon">🤍</div>
        <h3>No Saved Properties</h3>
        <p>Click the heart icon on any property card to save it here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="saved-tab-heading">❤️ Saved Properties ({savedProps.length})</h2>
      {savedProps.length === 0 ? (
        <div className="listings-empty">
          <p>Your saved properties haven't been loaded yet. Browse the For Sale or Let tabs first.</p>
        </div>
      ) : (
        <div className="listings-grid">
          {savedProps.map(p => (
          <ListingCard key={p.id} p={p} t={t} onContactAgent={onContactAgent} favorites={favorites} onToggleFavorite={onToggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- MAIN ----

function ListingsPageInner() {
  const { theme, toggleTheme } = useTheme();
  const { currency, changeCurrency, formatPrice, currencies } = useCurrency();

  const [lang, setLang] = useState(() => localStorage.getItem('gkr-lang') || 'EN');
  const t = i18n[lang] || i18n.EN;

  const [propertyList, setPropertyList]   = useState([]);
  const [pagination, setPagination]       = useState({ total: 0, page: 1, limit: 12, totalPages: 0 });
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [activeTab, setActiveTab]         = useState('sale');
  const [filters, setFilters]             = useState({ propertyType: '', minPrice: '', maxPrice: '', bedrooms: '' });
  const [favorites, setFavorites]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('gkr-favorites') || '[]'); } catch { return []; }
  });
  const [allLoadedProps, setAllLoadedProps] = useState([]);
  const [modal, setModal]                 = useState(null);

  const changeLang = (l) => { setLang(l); localStorage.setItem('gkr-lang', l); };

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('gkr-favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  const getTabParams = useCallback(() => {
    if (activeTab === 'sale')     return { listingType: 'sale' };
    if (activeTab === 'long-let') return { listingType: 'rent', rentalType: 'long_let' };
    if (activeTab === 'short-let') return { listingType: 'rent', rentalType: 'short_let' };
    return {};
  }, [activeTab]);

  const isPropertyTab = ['sale', 'long-let', 'short-let'].includes(activeTab);
  const needsListings = isPropertyTab || activeTab === 'property-map' || activeTab === 'saved';

  const fetchListings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...getTabParams(), page, limit: 12 };
      if (search)              params.search       = search;
      if (filters.propertyType) params.propertyType = filters.propertyType;
      if (filters.minPrice)    params.minPrice     = filters.minPrice;
      if (filters.maxPrice)    params.maxPrice     = filters.maxPrice;
      if (filters.bedrooms)    params.bedrooms     = filters.bedrooms;
      // TODO: enable postedToWebsite filter when all existing properties have been migrated
      // params.postedToWebsite = true;

      const res = await listings.getAll(params);
      if (res.success) {
        setPropertyList(res.data.properties);
        setPagination(res.data.pagination);
        setAllLoadedProps(prev => {
          const map = new Map(prev.map(p => [p.id, p]));
          res.data.properties.forEach(p => map.set(p.id, p));
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filters, getTabParams]);

  useEffect(() => {
    if (!needsListings) return;
    const timer = setTimeout(() => fetchListings(1), 300);
    return () => clearTimeout(timer);
  }, [fetchListings, needsListings]);

  const handleFilterChange = (e) => setFilters(f => ({ ...f, [e.target.name]: e.target.value }));

  const clearFilters = () => {
    setSearch('');
    setFilters({ propertyType: '', minPrice: '', maxPrice: '', bedrooms: '' });
  };

  const TABS = [
    { id: 'sale',         label: t.tab_sale },
    { id: 'long-let',     label: t.tab_long_let },
    { id: 'short-let',    label: t.tab_short_let },
    ...SERVICE_TABS.map(s => ({ id: s.id, label: s.label })),
    { id: 'calculators',  label: t.tab_calculators },
    { id: 'demand-map',   label: t.tab_demand_map },
    { id: 'property-map', label: t.tab_property_map },
    { id: 'saved',        label: `${t.tab_saved}${favorites.length > 0 ? ` (${favorites.length})` : ''}` },
  ];

  const activeService = SERVICE_TABS.find(s => s.id === activeTab);

  return (
    <div className="listings-page">

      {/* ── Header ── */}
      <header className="listings-header">
        <div className="listings-header-inner">
          <div className="listings-logo">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
              <span className="listings-logo-icon">🗝️</span>
              <div>
                <div className="listings-logo-title">Golden Key Realty</div>
                <div className="listings-logo-sub">Malta's Premium Property Portal</div>
              </div>
            </Link>
          </div>
          <div className="listings-header-actions">
            <select className="header-select" value={lang} onChange={e => changeLang(e.target.value)} title="Language">
              <option value="EN">🇬🇧 EN</option>
              <option value="MT">🇲🇹 MT</option>
              <option value="IT">🇮🇹 IT</option>
            </select>
            <select className="header-select" value={currency} onChange={e => changeCurrency(e.target.value)} title="Currency">
              {Object.entries(currencies).map(([code, info]) => (
                <option key={code} value={code}>{info.symbol} {code}</option>
              ))}
            </select>
            <button className="listings-theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-label="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="header-cta-btn" onClick={() => setModal({ type: 'list-property' })}>{t.btn_list_property}</button>
            <button className="header-cta-btn header-cta-outline" onClick={() => setModal({ type: 'affiliate' })}>{t.btn_affiliate}</button>
            <button className="header-cta-btn header-cta-outline" onClick={() => setModal({ type: 'join-team' })}>{t.btn_join_team}</button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="listings-hero">
        <h1>{t.hero_title}</h1>
        <p>{t.hero_sub}</p>
        <div className="listings-search-bar">
          <input
            type="search"
            className="listings-search-input"
            placeholder={t.search_placeholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="listings-tabs-wrapper">
          <div className="listings-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`listings-tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="listings-content">

        {/* Demand Map */}
        {activeTab === 'demand-map' && (
          <div className="listings-body-full"><DemandMapTab /></div>
        )}

        {/* Property Map */}
        {activeTab === 'property-map' && (
          <div className="listings-body-full">
            <PropertyMapTab properties={allLoadedProps.length > 0 ? allLoadedProps : propertyList} />
          </div>
        )}

        {/* Calculators */}
        {activeTab === 'calculators' && (
          <div className="listings-body-full"><CalculatorsTab /></div>
        )}

        {/* Saved */}
        {activeTab === 'saved' && (
          <div className="listings-body-full">
            <SavedTab
              favorites={favorites}
              allProperties={allLoadedProps}
              onContactAgent={p => setModal({ type: 'contact-agent', property: p })}
              onToggleFavorite={toggleFavorite}
              t={t}
            />
          </div>
        )}

        {/* Service tabs */}
        {activeService && (
          <div className="listings-body-full">
            <ServiceTab key={activeTab} category={activeService.category} title={activeService.title} emoji={activeService.emoji} />
          </div>
        )}

        {/* Property listing tabs */}
        {isPropertyTab && (
          <div className="listings-body">
            {/* Filters sidebar */}
            <aside className="listings-filters">
              <div className="filter-header">
                <h3>Filters</h3>
                <button className="filter-clear" onClick={clearFilters}>{t.clear_filters}</button>
              </div>
              <div className="filter-group">
                <label>{t.filter_property_type}</label>
                <select name="propertyType" className="filter-select" value={filters.propertyType} onChange={handleFilterChange}>
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map(tp => (
                    <option key={tp} value={tp}>{tp.charAt(0).toUpperCase() + tp.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>{t.filter_min_price}</label>
                <input name="minPrice" type="number" className="filter-input" placeholder="e.g. 100000" value={filters.minPrice} onChange={handleFilterChange} />
              </div>
              <div className="filter-group">
                <label>{t.filter_max_price}</label>
                <input name="maxPrice" type="number" className="filter-input" placeholder="e.g. 500000" value={filters.maxPrice} onChange={handleFilterChange} />
              </div>
              <div className="filter-group">
                <label>{t.filter_bedrooms}</label>
                <select name="bedrooms" className="filter-select" value={filters.bedrooms} onChange={handleFilterChange}>
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
                </select>
              </div>
              <div className="filter-cta">
                <button className="btn btn-primary w-full" onClick={() => fetchListings(1)}>{t.search_btn}</button>
              </div>
            </aside>

            {/* Results */}
            <main className="listings-results">
              <div className="listings-results-header">
                <span className="listings-count">
                  {loading ? 'Loading…' : `${pagination.total} ${pagination.total === 1 ? 'property' : 'properties'} found`}
                </span>
              </div>

              {loading ? (
                <div className="listings-spinner" />
              ) : propertyList.length === 0 ? (
                <div className="listings-empty">
                  <div className="listings-empty-icon">🏠</div>
                  <h3>No properties found</h3>
                  <p>Try adjusting your filters or search terms.</p>
                  <button className="listings-btn-outline" onClick={clearFilters}>{t.clear_filters}</button>
                </div>
              ) : (
                <div className="listings-grid">
                  {propertyList.map(p => (
            <ListingCard
                      key={p.id}
                      p={p}
                      t={t}
                      onContactAgent={prop => setModal({ type: 'contact-agent', property: prop })}
                      favorites={favorites}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="listings-pagination">
                  {pagination.page > 1 && (
                    <button className="listings-page-btn" onClick={() => fetchListings(pagination.page - 1)}>← Prev</button>
                  )}
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pg => (
                    <button
                      key={pg}
                      className={`listings-page-btn${pg === pagination.page ? ' active' : ''}`}
                      onClick={() => fetchListings(pg)}
                    >
                      {pg}
                    </button>
                  ))}
                  {pagination.page < pagination.totalPages && (
                    <button className="listings-page-btn" onClick={() => fetchListings(pagination.page + 1)}>Next →</button>
                  )}
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="listings-footer">
        <p>© {new Date().getFullYear()} Golden Key Realty Malta · All Rights Reserved</p>
      </footer>

      {/* ── Modals ── */}
      {modal?.type === 'list-property' && (
        <ModalForm title="List Your Property" subtitle="Get your property in front of thousands of buyers and renters." onClose={() => setModal(null)} source="website_list_property" />
      )}
      {modal?.type === 'affiliate' && (
        <ModalForm title="Become an Affiliate" subtitle="Earn commissions by referring clients to Golden Key Realty." onClose={() => setModal(null)} source="website_affiliate" />
      )}
      {modal?.type === 'join-team' && (
        <ModalForm title="Join Our Team" subtitle="We're looking for talented real estate professionals in Malta." onClose={() => setModal(null)} source="website_join_team" />
      )}
      {modal?.type === 'contact-agent' && modal.property && (
        <ModalForm
          title={`Enquire about: ${modal.property.title}`}
          subtitle={`${modal.property.city || 'Malta'} · ${formatPrice(modal.property.price)}`}
          onClose={() => setModal(null)}
          propertyId={modal.property.id}
          source="website"
          listingType={modal.property.listingType}
        />
      )}

      {/* ── AI Chatbot ── */}
      <AIChatbot variant="listings" />
      <WhatsAppButton />
      <Footer />
    </div>
  );
}

// Wrap with CurrencyProvider so useCurrency works inside ListingsPageInner
export default function ListingsPage() {
  return (
    <CurrencyProvider>
      <ListingsPageInner />
    </CurrencyProvider>
  );
}
