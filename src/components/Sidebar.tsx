import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquarePlus,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/lib/useMediaQuery";
import { cn } from "@/lib/cn";
import { IconButton } from "./ui/IconButton";
import { KeyHint } from "./ui/KeyHint";
import { Logo } from "./Logo";

function groupByDate(items: { id: string; title: string; updatedAt: number }[]) {
  const now = Date.now();
  const day = 86400000;
  const groups: Record<string, typeof items> = {
    Today: [],
    Yesterday: [],
    "Last 7 days": [],
    Older: [],
  };
  for (const it of items) {
    const age = now - it.updatedAt;
    if (age < day) groups.Today.push(it);
    else if (age < 2 * day) groups.Yesterday.push(it);
    else if (age < 7 * day) groups["Last 7 days"].push(it);
    else groups.Older.push(it);
  }
  return groups;
}

export function Sidebar() {
  const isMobile = useIsMobile();
  const open = useStore((s) => s.sidebarOpen);
  const setSidebar = useStore((s) => s.setSidebar);
  const conversations = useStore((s) => s.conversations);
  const activeId = useStore((s) => s.activeId);
  const newConversation = useStore((s) => s.newConversation);
  const selectConversation = useStore((s) => s.selectConversation);
  const deleteConversation = useStore((s) => s.deleteConversation);

  const [q, setQ] = useState("");

  // Auto-close on mobile when the viewport flips, so we don't leave the
  // drawer hanging open after a desktop session.
  useEffect(() => {
    if (isMobile) setSidebar(false);
    else setSidebar(true);
    // run only when mobile state flips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const filtered = useMemo(() => {
    const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q.trim()) return sorted;
    const needle = q.toLowerCase();
    return sorted.filter((c) => c.title.toLowerCase().includes(needle));
  }, [conversations, q]);

  const grouped = groupByDate(filtered);

  // On mobile, picking a conversation or starting a new one closes the drawer.
  const onPick = (id: string) => {
    selectConversation(id);
    if (isMobile) setSidebar(false);
  };
  const onNew = () => {
    newConversation();
    if (isMobile) setSidebar(false);
  };

  return (
    <>
      {/* mobile backdrop */}
      <AnimatePresence>
        {isMobile && open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebar(false)}
            className="fixed inset-0 z-30 bg-black/55 backdrop-blur-[3px] md:hidden"
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {(open || !isMobile) && (
          <motion.aside
            key={isMobile ? "mobile" : "desktop"}
            initial={
              isMobile
                ? { x: -300, opacity: 1 }
                : { width: 0, opacity: 0 }
            }
            animate={
              isMobile
                ? { x: open ? 0 : -300, opacity: 1 }
                : { width: 272, opacity: 1 }
            }
            exit={
              isMobile
                ? { x: -300, opacity: 1 }
                : { width: 0, opacity: 0 }
            }
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "flex flex-col overflow-hidden border-r border-[color:var(--color-border)]",
              isMobile
                ? "fixed inset-y-0 left-0 z-40 w-[280px] shadow-[0_0_60px_-10px_rgba(0,0,0,0.6)]"
                : "relative z-10 h-full shrink-0",
            )}
            style={{
              background: "color-mix(in oklch, var(--color-bg) 90%, transparent)",
              backdropFilter: "blur(28px) saturate(140%)",
              WebkitBackdropFilter: "blur(28px) saturate(140%)",
            }}
          >
            <div
              className={cn(
                "flex h-full flex-col",
                isMobile ? "w-[280px]" : "w-[272px]",
              )}
            >
              {/* brand row */}
              <div className="flex items-center gap-2.5 px-4 pt-4 pb-4">
                <Logo size={20} />
                <span className="text-[15px] font-semibold tracking-[-0.012em] text-[color:var(--color-text)]">
                  aston
                  <span className="text-[color:var(--color-accent)]">.ai</span>
                </span>
                {isMobile && (
                  <button
                    onClick={() => setSidebar(false)}
                    aria-label="Close sidebar"
                    className="ml-auto flex h-7 w-7 items-center justify-center rounded-[7px] text-[color:var(--color-faint)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text)]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* new chat */}
              <div className="px-3 pb-2">
                <button
                  onClick={onNew}
                  className="group flex w-full items-center gap-2.5 rounded-[11px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-[9px] text-[13.5px] font-medium text-[color:var(--color-text)] transition-all duration-150 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface-hover)] active:scale-[0.99]"
                >
                  <MessageSquarePlus
                    size={15}
                    strokeWidth={2}
                    className="text-[color:var(--color-muted)] group-hover:text-[color:var(--color-text)]"
                  />
                  <span>New chat</span>
                  {!isMobile && (
                    <span className="ml-auto flex items-center gap-1">
                      <KeyHint>⌘</KeyHint>
                      <KeyHint>N</KeyHint>
                    </span>
                  )}
                </button>
              </div>

              {/* search */}
              <div className="px-3 pb-3">
                <div className="flex items-center gap-2 rounded-[10px] border border-transparent bg-[color:var(--color-surface)]/60 px-2.5 py-[7px] transition-colors focus-within:border-[color:var(--color-border-strong)] focus-within:bg-[color:var(--color-surface)]">
                  <Search
                    size={14}
                    strokeWidth={2}
                    className="text-[color:var(--color-faint)]"
                  />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search conversations"
                    className="w-full bg-transparent text-[13px] text-[color:var(--color-text)] placeholder:text-[color:var(--color-faint)] focus:outline-none"
                  />
                </div>
              </div>

              {/* list */}
              <div className="flex-1 overflow-y-auto px-2 pb-3">
                {filtered.length === 0 && (
                  <div className="px-3 pt-6 text-[12.5px] leading-relaxed text-[color:var(--color-faint)]">
                    {conversations.length === 0
                      ? "Your conversations will appear here."
                      : "No matches."}
                  </div>
                )}
                {Object.entries(grouped).map(([label, items]) =>
                  items.length === 0 ? null : (
                    <div key={label} className="mb-3">
                      <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-faint)]">
                        {label}
                      </div>
                      <div className="flex flex-col">
                        {items.map((c) => {
                          const isActive = c.id === activeId;
                          return (
                            <div
                              key={c.id}
                              className={cn(
                                "group relative flex items-center rounded-[9px] transition-colors",
                                isActive
                                  ? "bg-[color:var(--color-surface)]"
                                  : "hover:bg-[color:var(--color-surface)]/70",
                              )}
                            >
                              {isActive && (
                                <motion.div
                                  layoutId="active-conv"
                                  className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full"
                                  style={{ background: "var(--color-accent)" }}
                                  transition={{
                                    duration: 0.3,
                                    ease: [0.22, 1, 0.36, 1],
                                  }}
                                />
                              )}
                              <button
                                onClick={() => onPick(c.id)}
                                className={cn(
                                  "flex-1 truncate px-3 py-[7px] text-left text-[13.5px]",
                                  isActive
                                    ? "text-[color:var(--color-text)]"
                                    : "text-[color:var(--color-muted)] group-hover:text-[color:var(--color-text)]",
                                )}
                              >
                                {c.title || "Untitled"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteConversation(c.id);
                                }}
                                className="mr-1 flex h-7 w-7 items-center justify-center rounded-[6px] text-[color:var(--color-faint)] opacity-0 transition-all hover:bg-[color:var(--color-bg)] hover:text-[color:var(--color-text)] group-hover:opacity-100"
                                aria-label="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* footer */}
              <div className="mt-auto flex items-center justify-between border-t border-[color:var(--color-border)] px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[11.5px] font-semibold"
                    style={{
                      background: "var(--color-accent-soft)",
                      color: "var(--color-accent)",
                    }}
                  >
                    S
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium leading-tight text-[color:var(--color-text)]">
                      Personal
                    </span>
                    <span className="text-[11px] leading-tight text-[color:var(--color-faint)]">
                      Plus plan
                    </span>
                  </div>
                </div>
                <IconButton size="sm" label="Settings">
                  <Settings size={14.5} />
                </IconButton>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
