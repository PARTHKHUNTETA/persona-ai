function renderInline(text, keyPrefix) {
  // Split on **...**; odd indexes are the bold chunks.
  return text.split(/\*\*/).map((chunk, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyPrefix}-${i}`}>{chunk}</strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{chunk}</span>
    )
  );
}

function renderContent(text) {
  // Split into alternating [text, code, text, code, ...] using ``` fences.
  const parts = text.split(/```/);
  return parts.map((part, i) => {
    const isCode = i % 2 === 1;
    if (isCode) {
      // Drop an optional language label on the first line (e.g. ```js).
      const body = part.replace(/^[a-zA-Z0-9]*\n/, "");
      return (
        <pre className="code-block" key={i}>
          <code>{body}</code>
        </pre>
      );
    }
    // Turn markdown headings (#, ##, ###) into bold so they don't show raw.
    const normalized = part.replace(/^#{1,6}\s*(.+)$/gm, "**$1**");
    return <span key={i}>{renderInline(normalized, i)}</span>;
  });
}

export default function ChatMessage({ role, content, persona }) {
  const isUser = role === "user";
  return (
    <div className={`msg ${isUser ? "msg-user" : "msg-bot"}`}>
      {!isUser && (
        <div className="msg-avatar" style={{ background: persona.accent }}>
          {persona.avatar}
        </div>
      )}
      <div className="msg-bubble">
        {!isUser && <div className="msg-name">{persona.name}</div>}
        <div className="msg-text">
          {content ? renderContent(content) : <span className="typing">…</span>}
        </div>
      </div>
    </div>
  );
}
