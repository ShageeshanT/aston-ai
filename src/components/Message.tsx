import { motion } from "framer-motion";
import { Check, Copy, Pencil, RefreshCw, Volume2 } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { Message as MessageT } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Markdown } from "./Markdown";
import { Logo } from "./Logo";
import { KeyHint } from "./ui/KeyHint";

interface MessageProps {
  msg: MessageT;
  isLastAssistant?: boolean;
  canRegenerate?: boolean;
  canEdit?: boolean;
  onRegenerate?: () => void;
  onEdit?: (msgId: string, newContent: string) => void;
}

export function Message({
  msg,
  isLastAssistant,
  canRegenerate,
  canEdit,
  onRegenerate,
  onEdit,
}: MessageProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  if (msg.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        className="group flex w-full justify-end py-3"
      >
        <div className="flex max-w-[88%] flex-col items-end gap-1.5 sm:max-w-[78%]">
          {editing ? (
            <UserMessageEditor
              initial={msg.content}
              onCancel={() => setEditing(false)}
              onSubmit={(text) => {
                setEditing(false);
                onEdit?.(msg.id, text);
              }}
            />
          ) : (
            <>
              <div
                className="rounded-[18px] rounded-tr-[6px] px-4 py-2.5 text-[15.5px] leading-[1.55] text-[color:var(--color-text)]"
                style={{
                  background: "var(--color-user-bubble)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p className="whitespace-pre-wrap text-pretty">{msg.content}</p>
              </div>
              {canEdit && onEdit && (
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <MsgActionButton onClick={copy} label={copied ? "Copied" : "Copy"}>
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                  </MsgActionButton>
                  <MsgActionButton
                    label="Edit message"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil size={13} />
                  </MsgActionButton>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group flex w-full gap-3.5 py-4"
    >
      <div className="relative mt-0.5 shrink-0">
        <Logo size={22} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className={cn(
            msg.streaming && msg.content.length > 0 && "streaming-caret",
          )}
        >
          {msg.content.length === 0 && msg.streaming ? (
            <ThinkingDots />
          ) : (
            <Markdown content={msg.content} />
          )}
        </div>

        {!msg.streaming && msg.content.length > 0 && (
          <div className="-ml-1.5 mt-2 flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <MsgActionButton onClick={copy} label={copied ? "Copied" : "Copy"}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </MsgActionButton>
            {isLastAssistant && (
              <MsgActionButton
                label="Regenerate"
                disabled={!canRegenerate}
                onClick={onRegenerate}
              >
                <RefreshCw size={14} />
              </MsgActionButton>
            )}
            <MsgActionButton label="Read aloud">
              <Volume2 size={14} />
            </MsgActionButton>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function UserMessageEditor({
  initial,
  onCancel,
  onSubmit,
}: {
  initial: string;
  onCancel: () => void;
  onSubmit: (text: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`;
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === initial) {
      onCancel();
      return;
    }
    onSubmit(trimmed);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      className="flex w-full min-w-[260px] flex-col gap-2 rounded-[16px] border border-[color:var(--color-border-strong)] p-2.5"
      style={{ background: "var(--color-bg-elevated)" }}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        rows={1}
        className="block w-full resize-none bg-transparent px-1.5 pb-1 pt-1 text-[15.5px] leading-[1.55] text-[color:var(--color-text)] focus:outline-none"
        style={{ minHeight: 28, maxHeight: 320 }}
      />
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 text-[11px] text-[color:var(--color-faint)]">
          <KeyHint>↵</KeyHint>
          <span>save</span>
          <span className="mx-0.5 opacity-50">·</span>
          <KeyHint>esc</KeyHint>
          <span>cancel</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onCancel}
            className="rounded-[8px] px-2.5 py-1 text-[12.5px] font-medium text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text)]"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!value.trim()}
            className="rounded-[8px] px-2.5 py-1 text-[12.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "var(--color-accent)",
              color: "oklch(0.99 0 0)",
            }}
          >
            Save & rerun
          </button>
        </div>
      </div>
    </div>
  );
}

function MsgActionButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded-[7px] text-[color:var(--color-faint)] transition-all hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text)] active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-[5px] w-[5px] rounded-full"
          style={{ background: "var(--color-accent)" }}
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1.1, 0.85] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.18,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
