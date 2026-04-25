import { create } from "zustand";
import type { Conversation, Message } from "./types";
import { uid } from "./id";
import {
  deleteMessage,
  deleteMessagesAfter,
  loadAll,
  putConversation,
  putMessage,
  removeConversation,
} from "./db";

const DEFAULT_MODEL = "MiniMax-M2.7";

export type Theme = "dark" | "light";

const THEME_KEY = "aston:theme";

function loadTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

// Fire-and-forget persister that logs but never throws.
function fire(p: Promise<unknown>): void {
  p.catch((err) => console.error("[store] persist failed:", err));
}

interface State {
  conversations: Conversation[];
  activeId: string | null;
  sidebarOpen: boolean;
  isStreaming: boolean;
  theme: Theme;
  hydrated: boolean;

  active: () => Conversation | null;

  // lifecycle
  hydrate: () => Promise<void>;

  // conversations
  newConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;

  // messages
  appendMessage: (convId: string, msg: Message) => void;
  updateMessage: (convId: string, msgId: string, patch: Partial<Message>) => void;
  deleteMessageLocal: (convId: string, msgId: string) => void;
  truncateAfter: (convId: string, msgId: string) => void;

  // misc
  setStreaming: (v: boolean) => void;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const initialTheme = loadTheme();
applyTheme(initialTheme);

export const useStore = create<State>((set, get) => ({
  conversations: [],
  activeId: null,
  sidebarOpen: true,
  isStreaming: false,
  theme: initialTheme,
  hydrated: false,

  active: () => {
    const { conversations, activeId } = get();
    return conversations.find((c) => c.id === activeId) ?? null;
  },

  hydrate: async () => {
    try {
      const conversations = await loadAll();
      set({
        conversations,
        activeId: conversations[0]?.id ?? null,
        hydrated: true,
      });
    } catch (err) {
      console.error("[store] hydrate failed:", err);
      set({ hydrated: true });
    }
  },

  newConversation: () => {
    const id = uid("c");
    const now = Date.now();
    const conv: Conversation = {
      id,
      title: "New chat",
      messages: [],
      createdAt: now,
      updatedAt: now,
      model: DEFAULT_MODEL,
    };
    set((s) => ({
      conversations: [conv, ...s.conversations],
      activeId: id,
    }));
    fire(putConversation(conv));
    return id;
  },

  selectConversation: (id) => set({ activeId: id }),

  deleteConversation: (id) => {
    set((s) => {
      const remaining = s.conversations.filter((c) => c.id !== id);
      return {
        conversations: remaining,
        activeId: s.activeId === id ? (remaining[0]?.id ?? null) : s.activeId,
      };
    });
    fire(removeConversation(id));
  },

  renameConversation: (id, title) => {
    const now = Date.now();
    let updated: Conversation | null = null;
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== id) return c;
        updated = { ...c, title, updatedAt: now };
        return updated;
      }),
    }));
    if (updated) fire(putConversation(updated));
  },

  appendMessage: (convId, msg) => {
    const now = Date.now();
    let updated: Conversation | null = null;
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== convId) return c;
        const isFirstUserMsg =
          c.messages.length === 0 && msg.role === "user";
        const nextConv: Conversation = {
          ...c,
          messages: [...c.messages, msg],
          updatedAt: now,
          title: isFirstUserMsg
            ? msg.content.slice(0, 48).trim() || "New chat"
            : c.title,
        };
        updated = nextConv;
        return nextConv;
      }),
    }));
    fire(putMessage(msg, convId));
    if (updated) fire(putConversation(updated));
  },

  updateMessage: (convId, msgId, patch) => {
    const now = Date.now();
    let changedConv: Conversation | null = null;
    let changedMsg: Message | null = null;
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== convId) return c;
        const nextMessages = c.messages.map((m) => {
          if (m.id !== msgId) return m;
          const merged = { ...m, ...patch };
          changedMsg = merged;
          return merged;
        });
        changedConv = { ...c, messages: nextMessages, updatedAt: now };
        return changedConv;
      }),
    }));
    if (changedMsg) fire(putMessage(changedMsg, convId));
    if (changedConv) fire(putConversation(changedConv));
  },

  deleteMessageLocal: (convId, msgId) => {
    let changedConv: Conversation | null = null;
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== convId) return c;
        changedConv = {
          ...c,
          messages: c.messages.filter((m) => m.id !== msgId),
          updatedAt: Date.now(),
        };
        return changedConv;
      }),
    }));
    fire(deleteMessage(msgId));
    if (changedConv) fire(putConversation(changedConv));
  },

  truncateAfter: (convId, msgId) => {
    let changedConv: Conversation | null = null;
    let cutoffTs: number | null = null;
    set((s) => ({
      conversations: s.conversations.map((c) => {
        if (c.id !== convId) return c;
        const idx = c.messages.findIndex((m) => m.id === msgId);
        if (idx === -1) return c;
        cutoffTs = c.messages[idx].createdAt;
        changedConv = {
          ...c,
          messages: c.messages.slice(0, idx + 1),
          updatedAt: Date.now(),
        };
        return changedConv;
      }),
    }));
    if (cutoffTs != null) fire(deleteMessagesAfter(convId, cutoffTs));
    if (changedConv) fire(putConversation(changedConv));
  },

  setStreaming: (v) => set({ isStreaming: v }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),

  setTheme: (t) => {
    applyTheme(t);
    set({ theme: t });
  },
  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },
}));
