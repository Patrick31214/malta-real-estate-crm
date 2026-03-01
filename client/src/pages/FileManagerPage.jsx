import { FolderOpen } from 'lucide-react';

const categoryLabels = {
  contracts: 'Contracts',
  courses: 'Courses & Classes',
  'team-pictures': 'Team Pictures',
  events: 'Company Events',
  announcements: 'Announcements',
};

function FileManagerPage({ category }) {
  const label = categoryLabels[category] || 'Files';

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      padding: '48px 24px',
    }}>
      <div style={{
        background: 'var(--glass-bg, rgba(45,106,79,0.08))',
        border: '1px solid var(--glass-border, rgba(45,106,79,0.15))',
        borderRadius: 20,
        padding: '48px 64px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(45,106,79,0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        maxWidth: 560,
        width: '100%',
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #2D6A4F, #40916C)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 4px 16px rgba(45,106,79,0.4)',
        }}>
          <FolderOpen size={36} color="#D4AF37" strokeWidth={1.5} />
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 26,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 12,
        }}>
          {label}
        </h2>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 28,
        }}>
          This section is coming soon. You will be able to upload and manage {label.toLowerCase()} here.
        </p>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(212,175,55,0.12)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: 24,
          padding: '8px 20px',
          color: '#D4AF37',
          fontSize: 13,
          fontWeight: 600,
        }}>
          🚧 Coming Soon
        </div>
      </div>
    </div>
  );
}

export default FileManagerPage;
