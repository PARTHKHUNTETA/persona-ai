import { useEffect, useRef, useState } from "react";
import { personas, DEFAULT_PERSONA_ID, personaById } from "./personas/index.js";
import { getPersonaReply } from "./lib/chat.js";
import ChatMessage from "./components/ChatMessage.jsx";
import "./App.css";

export default function App() {
  const [personaId, setPersonaId] = useState(DEFAULT_PERSONA_ID);

  // Keep a SEPARATE conversation per persona so switching doesn't mix voices.
  // Shape: { hitesh: [{role, content}], piyush: [...] }
  const [chats, setChats] = useState({ hitesh: [], piyush: [] });

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const persona = personaById[personaId];
  const messages = chats[personaId];
  const scrollRef = useRef(null);

  // Auto-scroll to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isSending]);

  // Helper to update just the active persona's message list.
  function setActiveMessages(updater) {
    setChats((prev) => ({ ...prev, [personaId]: updater(prev[personaId]) }));
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    setError(null);
    setInput("");
    setIsSending(true);

    // 1) Add the user's message + an empty assistant bubble to fill.
    const history = [...messages, { role: "user", content: text }];
    setActiveMessages(() => [...history, { role: "assistant", content: "" }]);

    try {
      // 2) Wait for the full reply, then fill the empty assistant bubble once.
      //    The empty bubble shows a "typing…" indicator until this resolves.
      const reply = await getPersonaReply(persona, history);
      setActiveMessages((msgs) => {
        const copy = [...msgs];
        copy[copy.length - 1] = { role: "assistant", content: reply };
        return copy;
      });
    } catch (err) {
      console.error(err);
      setError(
        err?.message?.includes("API key")
          ? "Missing/invalid OpenAI key. Add VITE_OPENAI_API_KEY to your .env and restart the dev server."
          : "Something went wrong talking to the model. Check the console."
      );
      // Remove the empty assistant bubble on failure.
      setActiveMessages((msgs) => msgs.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Persona AI</h1>
        <p className="subtitle">Chat with your favourite coding educators</p>

        {/* Persona switcher */}
        <div className="switcher">
          {personas.map((p) => (
            <button
              key={p.id}
              className={`persona-tab ${p.id === personaId ? "active" : ""}`}
              style={p.id === personaId ? { borderColor: p.accent } : undefined}
              onClick={() => setPersonaId(p.id)}
            >
              <span className="persona-emoji">{p.avatar}</span>
              <span>
                <strong>{p.name}</strong>
                <small>{p.tagline}</small>
              </span>
            </button>
          ))}
        </div>
      </header>

      <main className="chat" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="empty">
            <div className="empty-emoji">{persona.avatar}</div>
            <p>
              Say hi to <strong>{persona.name}</strong> — ask about coding,
              projects, or career advice!
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} persona={persona} />
        ))}

        {error && <div className="error">{error}</div>}
      </main>

      <form className="composer" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          placeholder={`Message ${persona.name}…`}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
        />
        <div className="flex">
          <button type="button" disabled={isSending || messages.length === 0} onClick={() => setChats((prev) => ({ ...prev, [personaId]: [] }))}>
            Clear Chat History
          </button>
          <button type="submit"  disabled={isSending || !input.trim()}>
          {isSending ? "…" : "Send"}
        </button>
        </div>  
      </form>
    </div>
  );
}
