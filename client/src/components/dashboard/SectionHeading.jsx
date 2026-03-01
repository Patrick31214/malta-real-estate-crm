import { Link } from 'react-router-dom';

export function SectionHeading({ icon: Icon, title, linkTo, linkLabel }) {
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
