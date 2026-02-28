import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import './AIChatbot.css';

const GREETING = {
  id: 'greeting',
  role: 'bot',
  text: "👋 Hello! I'm the GKR AI Assistant. I can help you find properties, answer questions about the CRM, and more. How can I help you today?",
};

const QUICK_REPLIES = [
  'Show me available properties',
  'How do I add a property?',
  'What are the latest inquiries?',
  'Commission calculator info',
];

function getBotResponse(message) {
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

function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
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
        className="chatbot-toggle"
        onClick={() => setOpen(o => !o)}
        title="AI Assistant"
        aria-label="Open AI Assistant"
      >
        {open ? <X size={22} strokeWidth={2} /> : <MessageCircle size={22} strokeWidth={1.75} />}
        {!open && messages.length > 1 && <span className="chatbot-toggle-badge" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar"><Bot size={18} strokeWidth={1.75} /></div>
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
              {QUICK_REPLIES.map(q => (
                <button key={q} className="chatbot-quick-btn" onClick={() => sendMessage(q)}>
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
              placeholder="Ask me anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={typing}
            />
            <button
              className="chatbot-send"
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
