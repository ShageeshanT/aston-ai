import { motion } from "framer-motion";
import { Code2, Lightbulb, PenLine, Wand2 } from "lucide-react";
import type { ReactNode } from "react";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Late night";
};

const SUGGESTIONS: {
  icon: ReactNode;
  title: string;
  prompt: string;
}[] = [
  {
    icon: <Wand2 size={15} strokeWidth={2} />,
    title: "Explain a concept",
    prompt: "Explain quantum entanglement like I'm a curious 14-year-old.",
  },
  {
    icon: <PenLine size={15} strokeWidth={2} />,
    title: "Draft something",
    prompt: "Write a short, warm birthday message for a close friend.",
  },
  {
    icon: <Lightbulb size={15} strokeWidth={2} />,
    title: "Brainstorm",
    prompt: "Give me 5 weekend side-project ideas I could finish in 2 days.",
  },
  {
    icon: <Code2 size={15} strokeWidth={2} />,
    title: "Code help",
    prompt: "Why would a React useEffect cause an infinite loop?",
  },
];

export function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 pb-40 pt-16">
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.05, ease }}
        className="font-serif text-center text-[64px] font-normal leading-[1.02] tracking-[-0.02em] text-[color:var(--color-text)] text-balance md:text-[80px]"
      >
        <span className="italic text-[color:var(--color-accent)]">
          {greeting().split(" ")[0]}
        </span>{" "}
        {greeting().split(" ").slice(1).join(" ")}
        <span className="text-[color:var(--color-accent)]">.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.18, ease }}
        className="mt-5 text-center text-[17px] text-[color:var(--color-muted)] text-balance"
      >
        What can I help you think through today?
      </motion.p>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } },
        }}
        className="mt-14 grid w-full max-w-[660px] grid-cols-2 gap-2.5"
      >
        {SUGGESTIONS.map((s) => (
          <motion.button
            key={s.title}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
            }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onPick(s.prompt)}
            className="group relative flex flex-col gap-2 overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]/60 p-4 text-left backdrop-blur-xl transition-colors duration-200 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-bg-elevated)]"
          >
            <div className="flex items-center gap-2.5 text-[color:var(--color-accent)]">
              {s.icon}
              <span className="text-[14px] font-medium text-[color:var(--color-text)]">
                {s.title}
              </span>
            </div>
            <div className="text-[13.5px] leading-[1.55] text-[color:var(--color-muted)] line-clamp-2">
              {s.prompt}
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
