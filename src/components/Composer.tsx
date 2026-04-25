import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { motion } from "framer-motion";
import { ArrowUp, Image as ImageIcon, Mic, Paperclip, Square } from "lucide-react";
import { cn } from "@/lib/cn";
import { KeyHint } from "./ui/KeyHint";

interface Props {
  onSend: (text: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
  autoFocus?: boolean;
  initialValue?: string;
}

export function Composer({
  onSend,
  onStop,
  isStreaming,
  autoFocus,
  initialValue,
}: Props) {
  const [value, setValue] = useState(initialValue ?? "");
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const h = Math.min(el.scrollHeight, 220);
    el.style.height = `${h}px`;
  }, [value]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (initialValue !== undefined) setValue(initialValue);
  }, [initialValue]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div className="pointer-events-none relative z-10">
      <div
        className="pointer-events-none absolute inset-x-0 -top-16 h-16"
        style={{
          background:
            "linear-gradient(to top, var(--color-bg) 0%, oklch(from var(--color-bg) l c h / 0) 100%)",
        }}
      />

      <div
        className="pointer-events-auto mx-auto w-full max-w-[740px] px-3 pb-3 sm:px-5 sm:pb-5"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <motion.div
          animate={{
            boxShadow: focused
              ? "0 0 0 1px var(--color-border-strong) inset, 0 0 0 4px var(--color-accent-soft), 0 16px 50px -16px oklch(0 0 0 / 0.55)"
              : "0 0 0 1px var(--color-border) inset, 0 0 0 0px transparent, 0 10px 30px -14px oklch(0 0 0 / 0.4)",
          }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "relative rounded-[20px] transition-colors",
          )}
          style={{
            background: "var(--color-bg-elevated)",
          }}
        >
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={1}
            placeholder="Ask anything…"
            className="block max-h-[220px] w-full resize-none bg-transparent px-5 pb-1 pt-[18px] text-[16px] leading-[1.5] text-[color:var(--color-text)] placeholder:text-[color:var(--color-faint)] focus:outline-none"
            style={{ minHeight: 28 }}
          />

          <div className="flex items-center justify-between px-2 pb-2 pt-1">
            <div className="flex items-center gap-0.5">
              <ToolBtn label="Attach file">
                <Paperclip size={16} />
              </ToolBtn>
              <ToolBtn label="Image prompt">
                <ImageIcon size={16} />
              </ToolBtn>
              <ToolBtn label="Voice input">
                <Mic size={16} />
              </ToolBtn>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden items-center gap-1.5 pr-1 text-[11.5px] text-[color:var(--color-faint)] md:flex">
                <KeyHint>↵</KeyHint>
                <span>send</span>
                <span className="mx-0.5 opacity-50">·</span>
                <KeyHint>⇧↵</KeyHint>
                <span>newline</span>
              </div>

              {isStreaming ? (
                <button
                  onClick={onStop}
                  aria-label="Stop"
                  className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] transition-all hover:bg-[color:var(--color-surface-hover)] active:scale-95"
                >
                  <Square size={13} fill="currentColor" />
                </button>
              ) : (
                <motion.button
                  onClick={submit}
                  disabled={!canSend}
                  aria-label="Send"
                  animate={{
                    scale: canSend ? 1 : 0.96,
                    opacity: canSend ? 1 : 0.55,
                  }}
                  transition={{ duration: 0.15 }}
                  whileTap={canSend ? { scale: 0.92 } : undefined}
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-[12px] transition-colors",
                  )}
                  style={
                    canSend
                      ? {
                          background: "var(--color-accent)",
                          color: "oklch(0.99 0 0)",
                        }
                      : {
                          background: "var(--color-surface)",
                          color: "var(--color-faint)",
                        }
                  }
                >
                  <ArrowUp size={16} strokeWidth={2.6} />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="mt-2.5 text-center text-[11.5px] tracking-[0.005em] text-[color:var(--color-faint)]">
          aston can make mistakes — verify important info.
        </div>
      </div>
    </div>
  );
}

function ToolBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-[9px] text-[color:var(--color-faint)] transition-all hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text)] active:scale-95"
    >
      {children}
    </button>
  );
}
