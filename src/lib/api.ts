import type { Message } from "./types";

export type ChatTurn = Pick<Message, "role" | "content">;

// Streams text chunks from /api/chat. Emits plain text pieces.
// Caller is responsible for concatenating.
export async function* streamChat(
  messages: ChatTurn[],
  opts?: { model?: string; signal?: AbortSignal },
): AsyncGenerator<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages, model: opts?.model }),
    signal: opts?.signal,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.error) detail = errJson.error;
    } catch {
      try {
        const errText = await res.text();
        if (errText) detail = errText;
      } catch {
        /* ignore */
      }
    }
    throw new Error(detail);
  }

  if (!res.body) throw new Error("No response body from /api/chat");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value && value.byteLength > 0) {
        yield decoder.decode(value, { stream: true });
      }
    }
    // flush any remaining bytes
    const tail = decoder.decode();
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}
