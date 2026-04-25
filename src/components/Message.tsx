import { motion } from "framer-motion";
import { Check, Copy, RefreshCw, Volume2 } from "lucide-react";
import { useState } from "react";
import type { Message as MessageT } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Markdown } from "./Markdown";
import { Logo } from "./Logo";

interface MessageProps {
  msg: MessageT;
  isLastAssistant?: boolean;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
}

export function Message({
  msg,
  isLastAssistant,
  canRegenerate,
  onRegenerate,
}: MessageProps) {
  const [copied, setCopied] = useState(false);

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
        <div className="max-w-[88%] sm:max-w-[78%]">
          <div
            className="rounded-[18px] rounded-tr-[6px] px-4 py-2.5 text-[15.5px] leading-[1.55] text-[color:var(--color-text)]"
            style={{
              background: "var(--color-user-bubble)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p className="whitespace-pre-wrap text-pretty">{msg.content}</p>
          </div>
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
