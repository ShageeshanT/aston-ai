// Placeholder streaming until api/chat.ts is wired to MiniMax.
// Produces a realistic-feeling token stream so the UI feels alive.

const CANNED = [
  "Here's a quick thought on that. ",
  "The core idea is to focus on clarity first, then polish. ",
  "A few angles worth considering:\n\n",
  "1. **Start small.** Ship one piece end-to-end before adding modalities.\n",
  "2. **Prototype the feel.** Typography and spacing matter more than features early on.\n",
  "3. **Iterate in public.** Your own daily use is the best feedback loop.\n\n",
  "Want me to expand on any of these?",
];

export async function* mockStream(_prompt: string): AsyncGenerator<string> {
  const text = CANNED.join("");
  // emit in small chunks with variable delay for realism
  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + (2 + Math.floor(Math.random() * 4)));
    i += chunk.length;
    await new Promise((r) => setTimeout(r, 12 + Math.random() * 28));
    yield chunk;
  }
}
