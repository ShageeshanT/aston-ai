import Dexie, { type Table } from "dexie";
import type { Conversation, Message } from "./types";

// Row shape in IndexedDB. We denormalize messages into their own table
// with a conversationId foreign key so we can load incrementally and
// avoid rewriting the whole conversation on every turn.
export interface ConversationRow {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  systemPrompt?: string;
  archived?: number; // 0 | 1 — Dexie doesn't index booleans
}

export interface MessageRow extends Message {
  conversationId: string;
}

class AstonDB extends Dexie {
  conversations!: Table<ConversationRow, string>;
  messages!: Table<MessageRow, string>;

  constructor() {
    super("aston");
    this.version(1).stores({
      conversations: "id, updatedAt, createdAt, archived",
      messages: "id, conversationId, createdAt",
    });
  }
}

export const db = new AstonDB();

// ---- mappers ------------------------------------------------------------
function convToRow(c: Conversation): ConversationRow {
  return {
    id: c.id,
    title: c.title,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    model: c.model,
    systemPrompt: c.systemPrompt,
    archived: 0,
  };
}

function msgToRow(m: Message, conversationId: string): MessageRow {
  return { ...m, conversationId };
}

// ---- public api used by the store ---------------------------------------

export async function loadAll(): Promise<Conversation[]> {
  const [convRows, msgRows] = await Promise.all([
    db.conversations.orderBy("updatedAt").reverse().toArray(),
    db.messages.orderBy("createdAt").toArray(),
  ]);

  const byConv = new Map<string, Message[]>();
  for (const row of msgRows) {
    const arr = byConv.get(row.conversationId) ?? [];
    // strip the conversationId field when hydrating into the store shape
    const { conversationId, ...msg } = row;
    void conversationId;
    arr.push(msg);
    byConv.set(row.conversationId, arr);
  }

  return convRows.map<Conversation>((r) => ({
    id: r.id,
    title: r.title,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    model: r.model,
    systemPrompt: r.systemPrompt,
    messages: byConv.get(r.id) ?? [],
  }));
}

export function putConversation(c: Conversation): Promise<string> {
  return db.conversations.put(convToRow(c));
}

export function putMessage(m: Message, conversationId: string): Promise<string> {
  return db.messages.put(msgToRow(m, conversationId));
}

export async function deleteMessage(id: string): Promise<void> {
  await db.messages.delete(id);
}

export async function deleteMessagesAfter(
  conversationId: string,
  createdAtExclusive: number,
): Promise<void> {
  await db.messages
    .where({ conversationId })
    .filter((m) => m.createdAt > createdAtExclusive)
    .delete();
}

export async function removeConversation(id: string): Promise<void> {
  await db.transaction("rw", db.conversations, db.messages, async () => {
    await db.conversations.delete(id);
    await db.messages.where({ conversationId: id }).delete();
  });
}
