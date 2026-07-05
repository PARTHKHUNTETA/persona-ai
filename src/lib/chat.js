
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const MODEL = "gpt-5.4-mini"; 

const MAX_HISTORY_MESSAGES = 20;

function exampleMessages(persona) {
  return (persona.examples ?? []).flatMap((ex) => [
    { role: "user", content: ex.user },
    { role: "assistant", content: ex.assistant },
  ]);
}

function buildMessages(persona, history) {
  const recent = history.slice(-MAX_HISTORY_MESSAGES);
  return [
    { role: "system", content: persona.systemPrompt },
    ...exampleMessages(persona),
    ...recent,
  ];
}

export async function getPersonaReply(persona, history) {
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: buildMessages(persona, history),
    temperature: 0.8,
  });

  return completion.choices?.[0]?.message?.content ?? "";
}
