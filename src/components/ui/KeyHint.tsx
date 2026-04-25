import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function KeyHint({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-[5px] text-[10.5px] font-medium text-[color:var(--color-muted)] font-mono",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
