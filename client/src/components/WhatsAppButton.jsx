import './WhatsAppButton.css';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/35699800363?text=Hi%2C%20I%27m%20interested%20in%20your%20properties%20in%20Malta"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn"
      title="Chat on WhatsApp"
      aria-label="Chat on WhatsApp"
    >
      💬
    </a>
  );
}
