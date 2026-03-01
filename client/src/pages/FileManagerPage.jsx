import { useState, useRef } from 'react';
import { FolderOpen, FileText, Image, Film, Download, Upload } from 'lucide-react';
import './FileManagerPage.css';

const categoryLabels = {
  contracts: 'Contracts',
  courses: 'Courses & Classes',
  'team-pictures': 'Team Pictures',
  events: 'Company Events',
  announcements: 'Announcements',
};

const MOCK_FILES = {
  contracts: [
    { id: 1, name: 'Lease_Agreement_2024.pdf',          size: '1.2 MB',  date: '12 Jan 2024', type: 'pdf'  },
    { id: 2, name: 'Sale_Contract_Villa_Mellieha.pdf',   size: '856 KB',  date: '8 Feb 2024',  type: 'pdf'  },
    { id: 3, name: 'Service_Agreement_Template.docx',    size: '124 KB',  date: '3 Mar 2024',  type: 'docx' },
  ],
  courses: [
    { id: 1, name: 'Real_Estate_Law_101.pdf',            size: '4.5 MB',  date: '15 Jan 2024', type: 'pdf'  },
    { id: 2, name: 'Sales_Training_Guide.docx',          size: '2.1 MB',  date: '20 Feb 2024', type: 'docx' },
    { id: 3, name: 'AML_Compliance_Course.pdf',          size: '3.8 MB',  date: '5 Mar 2024',  type: 'pdf'  },
  ],
  'team-pictures': [
    { id: 1, name: 'Team_Photo_Q1_2024.jpg',             size: '3.2 MB',  date: '5 Jan 2024',  type: 'jpg'  },
    { id: 2, name: 'Office_Opening_Valletta.png',        size: '2.8 MB',  date: '10 Feb 2024', type: 'png'  },
    { id: 3, name: 'Award_Ceremony.jpg',                 size: '4.1 MB',  date: '18 Mar 2024', type: 'jpg'  },
  ],
  events: [
    { id: 1, name: 'Annual_Gala_2023.jpg',               size: '5.1 MB',  date: '15 Dec 2023', type: 'jpg'  },
    { id: 2, name: 'Charity_Run_Highlights.mp4',         size: '45 MB',   date: '22 Jan 2024', type: 'mp4'  },
    { id: 3, name: 'Open_House_Sliema.pdf',              size: '980 KB',  date: '9 Feb 2024',  type: 'pdf'  },
  ],
  announcements: [
    { id: 1, name: 'Q1_Company_Update.pdf',              size: '720 KB',  date: '1 Apr 2024',  type: 'pdf'  },
    { id: 2, name: 'Policy_Changes_2024.docx',           size: '280 KB',  date: '15 Mar 2024', type: 'docx' },
  ],
};

function FileIcon({ type }) {
  if (type === 'mp4') return <Film  size={18} className="fm-file-icon fm-file-icon--mp4"  />;
  if (type === 'pdf') return <FileText size={18} className="fm-file-icon fm-file-icon--pdf"  />;
  if (type === 'docx') return <FileText size={18} className="fm-file-icon fm-file-icon--docx" />;
  return <Image size={18} className="fm-file-icon fm-file-icon--img" />;
}

function FileManagerPage({ category }) {
  const label     = categoryLabels[category] || 'Files';
  const mockFiles = MOCK_FILES[category] || [];
  const [dragOver, setDragOver] = useState(false);
  const inputRef  = useRef(null);

  function handleDragOver(e)  { e.preventDefault(); setDragOver(true);  }
  function handleDragLeave()  { setDragOver(false); }
  function handleDrop(e)      { e.preventDefault(); setDragOver(false); }

  return (
    <div className="fm-page">
      {/* Header */}
      <div className="fm-header">
        <div className="fm-header-icon">
          <FolderOpen size={28} color="#C4875A" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="fm-title">{label}</h1>
          <p className="fm-subtitle">Manage and access your {label.toLowerCase()} files</p>
        </div>
      </div>

      <div
        className={`fm-upload-area${dragOver ? ' fm-upload-area--dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.jpg,.jpeg,.png,.webp,.mp4"
          style={{ display: 'none' }}
          onChange={() => {}}
        />
        <Upload size={36} className="fm-upload-icon" strokeWidth={1.5} />
        <p className="fm-upload-text">📁 Drag &amp; drop files here or click to browse</p>
        <p className="fm-upload-hint">Supported: PDF, DOCX, JPG, PNG, WEBP, MP4 · Max 50 MB per file</p>
        <div className="fm-upload-note">
          ℹ️ File uploads will be available once backend storage is configured
        </div>
      </div>

      {/* File list */}
      <div className="fm-file-list-section">
        <h2 className="fm-list-title">Files in {label}</h2>
        {mockFiles.length === 0 ? (
          <div className="fm-empty">No files uploaded yet.</div>
        ) : (
          <div className="fm-file-list">
            {mockFiles.map(file => (
              <div key={file.id} className="fm-file-row">
                <span className="fm-file-icon-wrap">
                  <FileIcon type={file.type} />
                </span>
                <div className="fm-file-info">
                  <span className="fm-file-name">{file.name}</span>
                  <span className="fm-file-meta">{file.size} · {file.date}</span>
                </div>
                <button className="fm-download-btn" title="Download" disabled>
                  <Download size={14} strokeWidth={1.75} />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="fm-demo-note">* Sample files shown for demo. Real files will appear once storage is configured.</p>
      </div>
    </div>
  );
}

export default FileManagerPage;
