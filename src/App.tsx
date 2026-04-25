import { useEffect } from "react";
import { Toaster } from "sonner";
import { Aurora } from "./components/Aurora";
import { ChatView } from "./components/ChatView";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { useStore } from "./lib/store";

export default function App() {
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const newConversation = useStore((s) => s.newConversation);
  const hydrate = useStore((s) => s.hydrate);
  const hydrated = useStore((s) => s.hydrated);
  const theme = useStore((s) => s.theme);

  // Load persisted conversations from IndexedDB on mount.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "\\") {
        e.preventDefault();
        toggleSidebar();
      }
      if (mod && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        newConversation();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSidebar, newConversation]);

  if (!hydrated) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-5 w-5 animate-pulse rounded-full bg-[color:var(--color-accent-soft)]" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="relative flex h-full w-full overflow-hidden">
        <Aurora />
        <div className="relative z-10 flex h-full w-full">
          <Sidebar />
          <main className="relative flex min-w-0 flex-1 flex-col">
            <TopBar />
            <ChatView />
          </main>
        </div>
        <Toaster
          position="bottom-right"
          theme={theme}
          toastOptions={{
            style: {
              background: "var(--color-bg-elevated)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
              fontSize: "13px",
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}
