import { ChevronDown, Moon, PanelLeft, Share2, Sun } from "lucide-react";
import { useStore } from "@/lib/store";
import { IconButton } from "./ui/IconButton";
import { AnimatePresence, motion } from "framer-motion";

export function TopBar() {
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const active = useStore((s) => s.active());
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);

  return (
    <header
      className="sticky top-0 z-20 flex h-[52px] items-center gap-1.5 px-3"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in oklch, var(--color-bg) 70%, transparent) 0%, color-mix(in oklch, var(--color-bg) 40%, transparent) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <IconButton onClick={toggleSidebar} label="Toggle sidebar" size="sm">
        <PanelLeft size={15} />
      </IconButton>

      <div className="mx-1.5 h-3.5 w-px bg-[color:var(--color-border-strong)]" />

      <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
        <span className="block min-w-0 truncate text-[14px] font-medium tracking-[-0.005em] text-[color:var(--color-text)]">
          {active?.title || "New chat"}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button className="group flex items-center gap-1.5 rounded-[9px] px-2.5 py-1.5 text-[13px] font-medium text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text)]">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="pulse-dot absolute inset-0 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
          </span>
          <span>{active?.model || "MiniMax-M2.7"}</span>
          <ChevronDown size={13} className="opacity-50" />
        </button>

        <IconButton
          onClick={toggleTheme}
          label={theme === "dark" ? "Switch to light" : "Switch to dark"}
          size="sm"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </motion.span>
          </AnimatePresence>
        </IconButton>

        <IconButton size="sm" label="Share">
          <Share2 size={15} />
        </IconButton>
      </div>
    </header>
  );
}
