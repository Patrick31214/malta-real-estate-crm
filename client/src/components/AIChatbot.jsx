import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import './AIChatbot.css';

// ── CRM mode ──────────────────────────────────────────────────────────────────
const CRM_GREETING = {
  id: 'greeting',
  role: 'bot',
  text: "👋 Hello! I'm the GKR AI Assistant. I can help you find properties, answer questions about the CRM, and more. How can I help you today?",
};

const CRM_QUICK_REPLIES = [
  'Show me available properties',
  'How do I add a property?',
  'What are the latest inquiries?',
  'Commission calculator info',
];

function getCrmBotResponse(message) {
  const msg = message.toLowerCase();
  if (msg.includes('available') || msg.includes('properties') || msg.includes('listing')) {
    return "You can view all available properties by navigating to the **Properties** section in the sidebar. Use the status filter to show only 'Available' listings. 🏠";
  }
  if (msg.includes('add property') || msg.includes('new property')) {
    return "To add a property, go to **Properties → + Add Property**. You'll need to enter the title, type, price, location, and assign an owner and agent. 📋";
  }
  if (msg.includes('inquiry') || msg.includes('inquiries')) {
    return "You can view and manage all inquiries in the **Inquiries** section. New inquiries are marked with a badge and you can update their status from there. 📩";
  }
  if (msg.includes('commission') || msg.includes('calculator')) {
    return "Malta's standard commission rate is 5% of the sale price + 18% VAT on the commission. You can use the **Mortgage Calculator** for detailed financial planning. 💰";
  }
  if (msg.includes('dashboard') || msg.includes('stats')) {
    return "The **Dashboard** shows your total properties, available listings, under-offer properties, and owner count with a status breakdown chart. 📊";
  }
  if (msg.includes('owner')) {
    return "Manage property owners in the **Owners** section. You can add, edit, and view all owner details and their associated properties. 👤";
  }
  if (msg.includes('agent')) {
    return "Agent management is in the **Agents** section. You can track each agent's properties, contact details, and EIRA license information. 👔";
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hello! 👋 How can I assist you with Golden Key Realty CRM today?";
  }
  if (msg.includes('help')) {
    return "I can help with: finding properties, adding listings, managing inquiries, understanding commissions, or navigating the CRM. What do you need? 🤝";
  }
  return "I don't have specific information about that yet, but I'm learning! For complex queries, please contact your system administrator or check the documentation. 😊";
}

// ── Listings (public website) mode ────────────────────────────────────────────
const LISTINGS_GREETING = {
  id: 'greeting',
  role: 'bot',
  text: "👋 Hi! I'm GKR's AI assistant. Ask me about properties in Malta!",
};

const LISTINGS_QUICK_REPLIES = [
  'Properties in Sliema',
  'Apartments under €300k',
  '3 bedroom villas',
  'Properties for rent',
];

const MALTA_AREAS = [
  'sliema', "st. julian's", 'st julians', 'valletta', 'msida', 'swieqi',
  'naxxar', 'mosta', 'rabat', 'marsaskala', 'marsaxlokk', 'mdina',
  'birkirkara', 'qormi', 'zejtun', 'zabbar', 'fgura', 'paola',
  'san gwann', 'attard', 'balzan', 'lija', 'iklin', 'mellieha',
  'bugibba', 'st paul\'s bay', 'st pauls bay', 'xemxija', 'gozo', 'victoria',
  'marsalforn', 'xlendi', 'nadur', 'sannat', 'kercem', 'ghajnsielem',
];

function getListingsBotResponse(message) {
  const msg = message.toLowerCase();

  // Location search
  const matchedArea = MALTA_AREAS.find(area => msg.includes(area));
  if (matchedArea) {
    const areaName = matchedArea === 'st julians' ? "St. Julian's" : matchedArea.replace(/\b\w/g, c => c.toUpperCase());
    return `Great choice! **${areaName}** is a popular area in Malta. You can filter the listings above by location to see all available properties there. 📍 Would you like to know about prices or property types in ${areaName}?`;
  }

  // Price range
  if (msg.includes('cheap') || msg.includes('affordable') || msg.includes('budget') || (msg.includes('under') && (msg.includes('€') || msg.includes('eur') || msg.match(/\d/)))) {
    const priceMatch = msg.match(/(\d[\d,]*)\s*k?\b/);
    const rawNum = priceMatch ? parseInt(priceMatch[1].replace(',', ''), 10) : null;
    const price = rawNum ? (msg.includes('k') ? rawNum * 1000 : rawNum) : null;
    if (price && price >= 50000) {
      return `Looking for properties under **€${price.toLocaleString()}**? Use the **price filter** in the search panel to set your maximum budget. Malta has a wide range of apartments and houses at various price points! 💰`;
    }
    return "Looking for affordable properties? Use the **price range filter** in the search panel to set your budget. Entry-level apartments in Malta start from around €150,000. 💰";
  }

  if (msg.includes('expensive') || msg.includes('luxury') || msg.includes('premium') || msg.includes('high-end')) {
    return "For luxury properties, Malta offers stunning **penthouses in Sliema**, **sea-front villas** in Mellieħa, and **historic palazzos** in Valletta. Use the price filter to browse premium listings above €1M. ✨";
  }

  // Bedrooms
  const bedroomMatch = msg.match(/(\d+)\s*bed(?:room)?s?/);
  if (bedroomMatch || msg.includes('studio') || msg.includes('bedroom')) {
    if (msg.includes('studio')) {
      return "Studio apartments are great for young professionals! Filter by **'Studio'** or **0 bedrooms** in the search panel to find available studios across Malta. Prices start from around €130,000. 🛏️";
    }
    const beds = bedroomMatch ? bedroomMatch[1] : null;
    if (beds) {
      return `Looking for a **${beds}-bedroom** property? Use the bedroom filter in the search panel to narrow down your results. I can also help you with location or price range! 🛏️`;
    }
    return "How many bedrooms are you looking for? You can filter by number of bedrooms in the search panel — from studios to 5+ bedroom villas! 🛏️";
  }

  // Property types
  if (msg.includes('apartment') || msg.includes('flat')) {
    return "Malta has a wide range of **apartments** — from modern sea-view flats in Sliema to budget-friendly options in Mosta. Use the **property type** filter to browse all available apartments. 🏢";
  }
  if (msg.includes('villa')) {
    return "Looking for a **villa**? Malta's villas often feature private pools and gardens. Popular villa areas include Mellieħa, Naxxar, and Attard. Filter by **'Villa'** type in the search panel. 🏡";
  }
  if (msg.includes('penthouse')) {
    return "**Penthouses** in Malta offer stunning views and luxury finishes. The best are found in Sliema, St. Julian's, and Valletta. Filter by **'Penthouse'** in the property type dropdown. 🌅";
  }
  if (msg.includes('townhouse') || msg.includes('town house')) {
    return "**Townhouses** are a classic Maltese property type, often with character features like stone walls and traditional architecture. Filter by **'Townhouse'** to browse available options. 🏘️";
  }
  if (msg.includes('farmhouse')) {
    return "**Farmhouses** (also known as 'razzett' in Maltese) are unique countryside properties with traditional charm. They're most common in Gozo and central Malta. Filter by **'Farmhouse'** to explore! 🌾";
  }
  if (msg.includes('commercial') || msg.includes('office') || msg.includes('warehouse')) {
    return "For **commercial properties**, including offices and warehouses, filter by the relevant property type in the search panel. Malta's business districts are in Birkirkara, Mriehel, and the Grand Harbour area. 🏢";
  }

  // Rent vs buy
  if (msg.includes('rent') || msg.includes('long let') || msg.includes('long-let')) {
    return "Looking to **rent**? Filter by **'Rent'** in the listing type dropdown. Long lets in Malta typically run 12+ months. Popular areas for rentals include Sliema, St. Julian's, and Msida. 🔑";
  }
  if (msg.includes('short') || msg.includes('holiday') || msg.includes('airbnb') || msg.includes('short let')) {
    return "Interested in **short-term rentals** or holiday lets? Filter by **'Short Let'** to find holiday apartments. Malta is a top destination — especially in Sliema and St. Julian's! 🌴";
  }
  if (msg.includes('buy') || msg.includes('purchase') || msg.includes('sale') || msg.includes('for sale')) {
    return "Ready to **buy**? Filter by **'Sale'** in the listing type dropdown. Malta's property market is strong, with prices varying from €150k for a small apartment to €3M+ for luxury villas. 🏠";
  }

  // Features
  if (msg.includes('pool') || msg.includes('swimming')) {
    return "Love a **pool**? Filter by the 'Pool' feature in the search panel to find properties with private or communal pools. Villas in Mellieħa and Naxxar often come with private pools! 🏊";
  }
  if (msg.includes('sea view') || msg.includes('sea front') || msg.includes('seafront') || msg.includes('sea-front')) {
    return "**Sea-front** and **sea-view** properties are among Malta's most sought-after! Filter by 'Sea View' or 'Sea Front' in the features section. Sliema, St. Julian's, and Mellieħa have stunning coastal options. 🌊";
  }
  if (msg.includes('garage') || msg.includes('parking')) {
    return "Need **parking**? Filter by 'Parking' or 'Garage' in the features section. Parking is a premium feature in Malta's busy towns, so it's worth searching for specifically. 🚗";
  }
  if (msg.includes('garden') || msg.includes('yard') || msg.includes('outdoor')) {
    return "Looking for an **outdoor space**? Filter by 'Garden', 'Private Garden', or 'Terrace' in the features section. Properties with gardens are more common in quieter towns like Attard, Lija, and Naxxar. 🌿";
  }

  // Gozo
  if (msg.includes('gozo')) {
    return "**Gozo** is Malta's sister island — quieter, greener, and often more affordable. It's perfect for holiday homes or remote working. Filter by location 'Gozo' to browse available properties. 🏝️";
  }

  // Greetings
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hello! 👋 I'm here to help you find your perfect property in Malta. You can ask me about specific locations, price ranges, property types, or features. What are you looking for?";
  }

  // Help
  if (msg.includes('help') || msg.includes('what can you')) {
    return "I can help you search for properties in Malta by:\n• 📍 **Location** (e.g., Sliema, Valletta, Gozo)\n• 💰 **Price range** (e.g., apartments under €300k)\n• 🛏️ **Bedrooms** (e.g., 3 bedroom villa)\n• 🏠 **Property type** (apartment, villa, townhouse...)\n• ✨ **Features** (sea view, pool, garden)\nWhat are you looking for?";
  }

  // Contact
  if (msg.includes('contact') || msg.includes('agent') || msg.includes('call') || msg.includes('phone') || msg.includes('email')) {
    return "To contact an agent about a specific property, click the **'Enquire'** button on any listing card. Our agents are available Mon–Sat, 9am–6pm. 📞";
  }

  // Price info
  if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
    return "Malta property prices vary widely:\n• **Studio/1-bed apartment**: €130k – €250k\n• **2-bed apartment**: €200k – €450k\n• **3-bed apartment/townhouse**: €300k – €700k\n• **Villa with pool**: €500k – €3M+\nUse the price filter to search within your budget! 💶";
  }

  return "I can help you find the perfect property in Malta! Try asking about a specific **location** (Sliema, Valletta...), **price range**, **number of bedrooms**, or **property type** (apartment, villa...). 🏠";
}

function AIChatbot({ variant = 'crm' }) {
  const isListings = variant === 'listings';
  const greeting = isListings ? LISTINGS_GREETING : CRM_GREETING;
  const quickReplies = isListings ? LISTINGS_QUICK_REPLIES : CRM_QUICK_REPLIES;
  const getBotResponse = isListings ? getListingsBotResponse : getCrmBotResponse;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([greeting]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const response = getBotResponse(msg);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: response }]);
      setTyping(false);
    }, 800 + Math.random() * 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format bot text with **bold** support
  function renderText(text) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        className={`chatbot-toggle${isListings ? ' chatbot-toggle-listings' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="AI Assistant"
        aria-label="Open AI Assistant"
      >
        {open ? <X size={22} strokeWidth={2} /> : <MessageCircle size={22} strokeWidth={1.75} />}
        {!open && messages.length > 1 && <span className="chatbot-toggle-badge" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className={`chatbot-window${isListings ? ' chatbot-window-listings' : ''}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className={`chatbot-avatar${isListings ? ' chatbot-avatar-listings' : ''}`}><Bot size={18} strokeWidth={1.75} /></div>
              <div>
                <div className="chatbot-name">GKR AI Assistant</div>
                <div className="chatbot-status">🟢 Online</div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`chatbot-msg chatbot-msg-${msg.role}`}>
                {msg.role === 'bot' && (
                  <div className="chatbot-msg-avatar"><Bot size={12} /></div>
                )}
                <div className="chatbot-msg-bubble">{renderText(msg.text)}</div>
              </div>
            ))}
            {typing && (
              <div className="chatbot-msg chatbot-msg-bot">
                <div className="chatbot-msg-avatar"><Bot size={12} /></div>
                <div className="chatbot-msg-bubble chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length === 1 && (
            <div className="chatbot-quick-replies">
              {quickReplies.map(q => (
                <button key={q} className={`chatbot-quick-btn${isListings ? ' chatbot-quick-btn-listings' : ''}`} onClick={() => sendMessage(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-row">
            <input
              className="chatbot-input"
              type="text"
              placeholder={isListings ? 'Search properties…' : 'Ask me anything…'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={typing}
            />
            <button
              className={`chatbot-send${isListings ? ' chatbot-send-listings' : ''}`}
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
            >
              <Send size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatbot;
