import { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[error-boundary]", error, info.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
  };

  reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] p-6 text-center">
          <h1 className="font-serif text-[28px] font-normal tracking-[-0.02em] text-[color:var(--color-text)]">
            Something broke.
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--color-muted)]">
            aston crashed while rendering. Your conversations are safe in local
            storage. Click reload to recover.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] p-3 text-left font-mono text-[11.5px] text-[color:var(--color-faint)]">
            {this.state.error.message}
          </pre>
          <div className="mt-5 flex justify-center gap-2">
            <button
              onClick={this.reset}
              className="rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3.5 py-2 text-[13px] font-medium text-[color:var(--color-text)] transition-colors hover:bg-[color:var(--color-surface-hover)]"
            >
              Try again
            </button>
            <button
              onClick={this.reload}
              className="flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[13px] font-medium transition-colors"
              style={{
                background: "var(--color-accent)",
                color: "oklch(0.99 0 0)",
              }}
            >
              <RotateCcw size={13} />
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
