import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import type { Message as MessageT } from "@/lib/types";
import { Message } from "./Message";

interface Props {
  messages: MessageT[];
  onRegenerate?: () => void;
  onEditUserMessage?: (msgId: string, newContent: string) => void;
  isStreaming?: boolean;
}

export function MessageList({
  messages,
  onRegenerate,
  onEditUserMessage,
  isStreaming,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const stickToBottom = useRef(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isAtBottom = dist < 40;
    setAtBottom(isAtBottom);
    stickToBottom.current = isAtBottom;
  };

  useLayoutEffect(() => {
    if (stickToBottom.current) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    stickToBottom.current = true;
  };

  // Find the id of the last assistant message so only it shows "regenerate".
  let lastAssistantId: string | undefined;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") {
      lastAssistantId = messages[i].id;
      break;
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[740px] px-4 pb-10 pt-2 sm:px-6">
          {messages.map((m) => (
            <Message
              key={m.id}
              msg={m}
              isLastAssistant={m.id === lastAssistantId}
              canRegenerate={!isStreaming}
              canEdit={!isStreaming}
              onRegenerate={onRegenerate}
              onEdit={onEditUserMessage}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <AnimatePresence>
        {!atBottom && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            onClick={scrollToBottom}
            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]/90 px-3 py-1.5 text-[12px] text-[color:var(--color-muted)] shadow-[var(--shadow-soft)] backdrop-blur-xl transition-colors hover:text-[color:var(--color-text)]"
          >
            <ArrowDown size={13} />
            New messages
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
