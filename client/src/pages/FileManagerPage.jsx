import { useState, useRef, useCallback } from 'react';
import { FolderOpen, Download, Trash2, FileText, Image, Search, Upload } from 'lucide-react';

const CATEGORIES = ['All', 'Contracts', 'Courses', 'Team Photos', 'Events', 'Announcements'];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileCard({ file, onDelete }) {
  const isImage = file.type.startsWith('image/');
  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius)',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {isImage && file.url ? (
        <div style={{ width: '100%', height: 120, overflow: 'hidden', borderRadius: 8, background: 'var(--bg-secondary)' }}>
          <img
            src={file.url}
            alt={file.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div style={{
          width: '100%', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-secondary)', borderRadius: 8,
          color: 'var(--emerald-primary)',
        }}>
          <FileText size={40} strokeWidth={1.25} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: 13, color: 'var(--text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }} title={file.name}>{file.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {formatSize(file.size)} · {file.category} · {file.date}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <a
          href={file.url}
          download={file.name}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
            background: 'var(--emerald-primary)', color: '#fff', textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          <Download size={13} /> Download
        </a>
        <button
          onClick={() => onDelete(file.id)}
          style={{
            padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(192,57,43,0.4)',
            background: 'rgba(192,57,43,0.1)', color: '#c0392b', cursor: 'pointer', fontSize: 12,
          }}
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function FileManagerPage() {
  const [files, setFiles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [dragging, setDragging] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('Contracts');
  const fileInputRef = useRef(null);
  const nextId = useRef(1);

  const addFiles = useCallback((fileList, category) => {
    const newFiles = Array.from(fileList).map(f => ({
      id: nextId.current++,
      name: f.name,
      size: f.size,
      type: f.type,
      category,
      date: new Date().toLocaleDateString(),
      url: URL.createObjectURL(f),
      file: f,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files, uploadCategory);
  }, [addFiles, uploadCategory]);

  const handleDragOver = e => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleFileInput = e => {
    if (e.target.files.length > 0) addFiles(e.target.files, uploadCategory);
    e.target.value = '';
  };

  const handleDelete = id => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.url) URL.revokeObjectURL(file.url);
      return prev.filter(f => f.id !== id);
    });
  };

  const filtered = files.filter(f =>
    (activeCategory === 'All' || f.category === activeCategory) &&
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const cardStyle = {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius)',
    padding: 24,
    marginBottom: 24,
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderOpen size={24} /> File Manager
        </h1>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {files.length} file{files.length !== 1 ? 's' : ''} stored
        </div>
      </div>

      {/* Upload area */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>Upload to:</label>
          <select
            value={uploadCategory}
            onChange={e => setUploadCategory(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: 6, border: '1px solid var(--glass-border)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer',
            }}
          >
            {CATEGORIES.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--emerald-primary)' : 'var(--glass-border)'}`,
            borderRadius: 'var(--radius-sm, 8px)',
            padding: '40px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'rgba(45,106,79,0.08)' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <Upload size={36} style={{ color: 'var(--emerald-primary)', marginBottom: 12 }} strokeWidth={1.5} />
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            Drop files here or click to browse
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supports images, PDFs, and all file types</div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />
      </div>

      {/* Category tabs + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                border: '1px solid',
                borderColor: activeCategory === cat ? 'var(--emerald-primary)' : 'var(--glass-border)',
                background: activeCategory === cat ? 'var(--emerald-primary)' : 'transparent',
                color: activeCategory === cat ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {cat}
              {cat !== 'All' && (
                <span style={{ marginLeft: 5, opacity: 0.7 }}>
                  ({files.filter(f => f.category === cat).length})
                </span>
              )}
              {cat === 'All' && (
                <span style={{ marginLeft: 5, opacity: 0.7 }}>({files.length})</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search files…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '7px 10px 7px 30px', borderRadius: 8,
              border: '1px solid var(--glass-border)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              fontSize: 13, outline: 'none',
            }}
          />
        </div>
      </div>

      {/* File grid */}
      {filtered.length === 0 ? (
        <div style={{
          ...cardStyle,
          textAlign: 'center', padding: '60px 24px',
          color: 'var(--text-muted)', fontSize: 14,
        }}>
          <FolderOpen size={48} strokeWidth={1.25} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div>{search || activeCategory !== 'All' ? 'No files match your filter.' : 'No files uploaded yet. Drop files above to get started.'}</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {filtered.map(file => (
            <FileCard key={file.id} file={file} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FileManagerPage;
