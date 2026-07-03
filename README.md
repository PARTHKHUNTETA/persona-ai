# Persona AI 🤖☕⚡

An AI-powered chat app that lets you talk to two well-known Indian coding
educators — **Hitesh Choudhary** and **Piyush Garg** — where an LLM responds in
each person's distinct speaking style, teaching approach, and personality.

Built with **React + Vite** and the **OpenAI API**.

> Reference sites for the personas: [hitesh.ai](https://hitesh.ai/) ·
> [piyushgarg.dev](https://www.piyushgarg.dev/)

---

## ✨ Features

- 💬 LLM-powered chat that responds **in character**
- 🔀 One-click switching between Hitesh and Piyush (each keeps its own conversation)
- ⚡ Streaming responses (text appears token-by-token)
- 🎨 Clean, responsive chat UI with code-block and bold formatting
- 🧠 Context management that keeps the persona consistent over long chats

---

## 🚀 Setup & Run

**Prerequisites:** Node.js 18+ and an [OpenAI API key](https://platform.openai.com/api-keys).

```bash
# 1. Install dependencies
npm install

# 2. Add your API key
cp .env.example .env
#    then edit .env and set VITE_OPENAI_API_KEY=sk-...

# 3. Start the dev server
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

```bash
npm run build     # production build into /dist
npm run preview   # preview the production build
```

### ⚠️ Security note about the API key

This demo calls OpenAI **directly from the browser** (`dangerouslyAllowBrowser`),
which means the key is visible in the frontend bundle. That's fine for a local
assignment, but **before deploying publicly** you should either:

- put the OpenAI call behind a small backend / serverless function, or
- use a key with a hard spending limit.

Never commit your real `.env` — it is git-ignored on purpose.

---

## 📁 Project Structure

```
src/
  personas/
    hitesh.js     # Hitesh persona: system prompt + few-shot examples
    piyush.js     # Piyush persona: system prompt + few-shot examples
    index.js      # registry — add a persona here and it appears in the UI
  lib/
    chat.js       # OpenAI client, message building, context trimming, streaming
  components/
    ChatMessage.jsx  # one chat bubble (renders code blocks + bold)
  App.jsx         # main UI: persona switcher + chat state
  App.css         # chat styling
```

---

## 📚 Documentation

### 1. How the persona data was collected & prepared

No model training or fine-tuning is used. Instead, each persona is a **detailed
"character sheet"** given to a general-purpose LLM (GPT-4o-mini) so it responds
*as* that person. This is in-context learning / prompt engineering.

The data was gathered by studying each person's **publicly available content**:

- **YouTube** — Hitesh's "Chai aur Code" channel and Piyush's channel: tone,
  catchphrases, teaching flow, how they address the audience.
- **Websites** — [hitesh.ai](https://hitesh.ai/), [piyushgarg.dev](https://www.piyushgarg.dev/):
  topics they focus on and how they describe themselves.
- **X / LinkedIn posts** — short-form voice and recurring phrases.

For each person we distilled that into:

1. **Identity & values** — who they are, what they care about.
2. **Speaking style** — language mix (Hitesh: heavy Hinglish; Piyush: mostly
   English with light Hinglish), signature phrases ("Haanji!", "chai aur code" /
   "let's build this", "here's the deal"), tone.
3. **Teaching approach** — Hitesh leads with intuition + encouragement; Piyush
   leads with industry context + build-first, trade-off-aware answers.
4. **Few-shot examples** — 2 real-*style* Q&A pairs per persona that anchor the
   voice (see `examples` in each persona file).

All of this lives in `src/personas/hitesh.js` and `src/personas/piyush.js`.

### 2. Prompt engineering strategy

Each request is assembled as:

```
[ system prompt ]  → the persona's full character sheet (identity, style, rules)
[ few-shot pairs ] → example user/assistant turns that demonstrate the voice
[ chat history ]   → the real conversation so far (trimmed, see below)
```

Key techniques used:

- **Role + rules framing** — the system prompt tells the model exactly who it is
  and gives explicit DO/DON'T rules (stay in character, don't overuse
  catchphrases, don't invent private facts, format for chat).
- **Few-shot anchoring** — the biggest lever for authenticity; the examples show
  the target rhythm rather than just describing it.
- **Temperature 0.8** — enough variety to feel human without going off-persona.

### 3. Context management approach

Handled in `src/lib/chat.js`:

- The **system prompt and few-shot examples are always included**, so the
  persona never drifts, even in a long conversation.
- Only the **live back-and-forth is trimmed** — we keep the most recent
  `MAX_HISTORY_MESSAGES` (20) turns. This caps token usage/cost and stays within
  model limits while preserving recent context and the persona.
- Each persona has its **own separate conversation** in React state
  (`chats: { hitesh: [...], piyush: [...] }`), so switching personas never mixes
  the two voices.

### 4. Sample conversations

**Hitesh Choudhary** — *"Bhai I am confused between DSA and web dev, what should I focus on?"*

> Haanji! Bahut se log yeh confusion face karte hain. Toh simple si baat hai —
> agar aapko job ke liye prepare karna hai, toh pehle **web development** par
> focus karo. Industry mein web dev ki demand bahut hai, aur aap projects bana
> ke apne portfolio ko strong kar sakte ho.
>
> Phir, jab aapko web dev ke concepts achhe se samajh aa jaye, tab **DSA** par
> dhyan dena shuru karo... Ghabraiye mat, har step pe seekhte rehna hai. Aage
> badhte rahiye, sab theek hoga! 🚀

**Piyush Garg** — *"How do I design a URL shortener like bit.ly?"*

> ...
> **3. Redirect Logic:** When someone hits the short URL, extract the short
> code, look it up in the database, and redirect:
>
> ```js
> app.get('/:shortCode', async (req, res) => {
>   const url = await getLongUrlFromDb(req.params.shortCode);
>   if (url) return res.redirect(url);
>   res.status(404).send('Not Found');
> });
> ```
>
> **4. Scaling:** As you get more users, consider caching frequent redirects
> (using Redis)... Let's build this! 🚀

*(Both generated live by the app — switch personas with the tabs at the top.)*

---

## 🛠️ Tech Stack

- **React 19** + **Vite** — UI and tooling
- **OpenAI API** (`gpt-4o-mini`) 
- Plain CSS — styling (no UI library, dependency-light)

## 🔮 Possible next steps

- Move the OpenAI call to a backend to hide the API key
- Add persistence (localStorage / DB) so chats survive refresh
- Add more personas (just drop a new file in `src/personas/`)
