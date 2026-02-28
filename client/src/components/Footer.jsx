import { Key } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Column 1 — Company Info */}
        <div>
          <div className="footer-company-name">
            <Key size={20} />
            Golden Key Realty
          </div>
          <p className="footer-tagline">
            Your trusted partner for premium properties across the Maltese islands.
          </p>
          <a
            href="https://wa.me/35699800363"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-whatsapp-link"
          >
            💬 +356 9980 0363
          </a>
        </div>

        {/* Column 2 — Quick Links */}
        <div>
          <h3 className="footer-col-title">Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#properties">Properties</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>

        {/* Column 3 — Legal */}
        <div>
          <h3 className="footer-col-title">Legal</h3>
          <ul className="footer-links">
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms">Terms &amp; Conditions</a></li>
            <li><a href="/cookies">Cookie Policy</a></li>
            <li><a href="#">GDPR Notice</a></li>
          </ul>
        </div>

        {/* Column 4 — Social Media */}
        <div>
          <h3 className="footer-col-title">Follow Us</h3>
          <ul className="footer-social-list">
            <li><a href="#" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Twitter</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">TikTok</a></li>
            <li>
              <a href="https://wa.me/35699800363" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Golden Key Realty. All rights reserved.</p>
        <p>Powered by Malta Real Estate CRM</p>
      </div>
    </footer>
  );
}
