import { useState, useEffect, useRef } from 'react';
import { agents, upload } from '../services/api';
import './Modal.css';

const defaultForm = {
  firstName: '', lastName: '', email: '',
  licenseNumber: '', specialization: '', commissionRate: '',
  phone: '', mobile: '', officeAddress: '', bio: '',
  languages: 'English', yearsExperience: '', profileImageUrl: ''
};

function AgentModal({ agent, onClose, onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (agent) {
      setForm({
        firstName: agent.user?.firstName || '',
        lastName: agent.user?.lastName || '',
        email: agent.user?.email || '',
        licenseNumber: agent.licenseNumber || '',
        specialization: agent.specialization || '',
        commissionRate: agent.commissionRate || '',
        phone: agent.phone || '',
        mobile: agent.mobile || '',
        officeAddress: agent.officeAddress || '',
        bio: agent.bio || '',
        languages: (agent.languages || ['English']).join(', '),
        yearsExperience: agent.yearsExperience || '',
        profileImageUrl: agent.profileImageUrl || ''
      });
    }
  }, [agent]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleProfileImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const res = await upload.files(files);
      const url = res?.data?.urls?.[0] || res?.urls?.[0];
      if (url) setForm(f => ({ ...f, profileImageUrl: url }));
    } catch {
      setError('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        commissionRate: form.commissionRate !== '' ? parseFloat(form.commissionRate) : 0,
        yearsExperience: form.yearsExperience !== '' ? parseInt(form.yearsExperience) : 0,
        languages: form.languages.split(',').map(l => l.trim()).filter(Boolean)
      };

      const res = agent
        ? await agents.update(agent.id, payload)
        : await agents.create(payload);

      if (res.success) {
        if (!agent && res.data.tempPassword) {
          setTempPassword(res.data.tempPassword);
        } else {
          onSaved();
        }
      } else {
        setError(res.message || 'Failed to save agent.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (tempPassword) {
    return (
      <div className="modal-overlay">
        <div className="modal-box" style={{ maxWidth: 440 }}>
          <div className="modal-header">
            <h2>✅ Agent Created</h2>
            <button className="modal-close" onClick={onSaved}>✕</button>
          </div>
          <div className="modal-form">
            <p style={{ marginBottom: 12, color: 'var(--text-medium)' }}>
              The agent account has been created. Share the temporary password below — the agent must change it on first login.
            </p>
            <div style={{ background: 'var(--bg-page)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontFamily: 'monospace', fontSize: 15, wordBreak: 'break-all', border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>Login Email</div>
              <strong>{form.email}</strong>
              <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 10, marginBottom: 4 }}>Temporary Password</div>
              <strong style={{ color: 'var(--primary)' }}>{tempPassword}</strong>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={onSaved}>Done</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>{agent ? 'Edit Agent' : 'Add New Agent'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="alert alert-error">{error}</div>}

          <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>
            {agent ? 'Update the agent profile details below.' : 'Creating an agent also creates a CRM login account for them.'}
          </p>

          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input name="firstName" className="form-input" value={form.firstName} onChange={handleChange} required placeholder="Maria" />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input name="lastName" className="form-input" value={form.lastName} onChange={handleChange} required placeholder="Borg" />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} required placeholder="maria.borg@agency.mt" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" className="form-input" value={form.phone} onChange={handleChange} placeholder="+356 2123 4567" />
            </div>
            <div className="form-group">
              <label>Mobile</label>
              <input name="mobile" className="form-input" value={form.mobile} onChange={handleChange} placeholder="+356 9912 3456" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>License Number</label>
              <input name="licenseNumber" className="form-input" value={form.licenseNumber} onChange={handleChange} placeholder="MLT-RE-2024-001" />
            </div>
            <div className="form-group">
              <label>Commission Rate (%)</label>
              <input name="commissionRate" type="number" step="0.1" min="0" max="100" className="form-input" value={form.commissionRate} onChange={handleChange} placeholder="2.5" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label>Specialization</label>
              <input name="specialization" className="form-input" value={form.specialization} onChange={handleChange} placeholder="Residential Properties, Luxury Apartments" />
            </div>
            <div className="form-group">
              <label>Years Experience</label>
              <input name="yearsExperience" type="number" min="0" className="form-input" value={form.yearsExperience} onChange={handleChange} placeholder="5" />
            </div>
          </div>

          <div className="form-group">
            <label>Languages (comma-separated)</label>
            <input name="languages" className="form-input" value={form.languages} onChange={handleChange} placeholder="English, Maltese, Italian" />
          </div>

          <div className="form-group">
            <label>Office Address</label>
            <input name="officeAddress" className="form-input" value={form.officeAddress} onChange={handleChange} placeholder="45, Republic Street, Valletta" />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea name="bio" className="form-input" rows={3} value={form.bio} onChange={handleChange} placeholder="Brief professional bio…" style={{ resize: 'vertical' }} />
          </div>

          <div className="form-group">
            <label>Profile Photo URL</label>
            <input name="profileImageUrl" type="url" className="form-input" value={form.profileImageUrl} onChange={handleChange} placeholder="https://example.com/photo.jpg" />
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? '⏳ Uploading…' : '📷 Upload Photo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleProfileImageUpload(e.target.files)}
              />
              {form.profileImageUrl && (
                <img
                  src={form.profileImageUrl}
                  alt="Preview"
                  onError={e => { e.target.style.display = 'none'; }}
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }}
                />
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : (agent ? 'Save Changes' : 'Add Agent')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AgentModal;
