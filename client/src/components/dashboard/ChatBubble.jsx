import { PRIORITY_CONFIG, initials } from './constants';

export function ChatBubble({ ann }) {
  const p = ann.priority || 'normal';
  const badge = PRIORITY_CONFIG[p] || PRIORITY_CONFIG.normal;
  const authorName = ann.author?.name || ann.authorName || ann.createdBy?.name || 'System';
  const ini = initials(authorName);
  const time = ann.createdAt
    ? new Date(ann.createdAt).toLocaleString('en-GB', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : '';
  const body = ann.body || ann.content || ann.message || '';
  return (
    <div className="chat-bubble">
      <div className="chat-bubble-avatar">{ini}</div>
      <div className="chat-bubble-content">
        <div className="chat-bubble-meta">
          <span className="chat-bubble-author">{authorName}</span>
          <span className="chat-bubble-time">{time}</span>
          <span
            className="ann-priority-badge chat-badge"
            style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.color}44` }}
          >
            {badge.pulse && <span className="ann-pulse-dot" style={{ background: badge.color }} />}
            {badge.label}
          </span>
        </div>
        {ann.title && <div className="chat-bubble-title">{ann.title}</div>}
        {body && <p className="chat-bubble-body">{body}</p>}
      </div>
    </div>
  );
}
