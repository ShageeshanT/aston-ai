import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "ghost" | "subtle" | "primary";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  label?: string;
}

const sizeMap: Record<Size, string> = {
  sm: "h-8 w-8 rounded-[8px]",
  md: "h-9 w-9 rounded-[10px]",
  lg: "h-11 w-11 rounded-[12px]",
};

const variantMap: Record<Variant, string> = {
  ghost:
    "text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:var(--color-surface)]",
  subtle:
    "text-[color:var(--color-text)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-hover)]",
  primary:
    "bg-[color:var(--color-accent)] text-[oklch(0.15_0.01_80)] hover:bg-[color:var(--color-accent-hover)]",
};

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "ghost", size = "md", className, children, label, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-150 active:scale-[0.96]",
          sizeMap[size],
          variantMap[variant],
          "disabled:opacity-40 disabled:pointer-events-none",
          className,
        )}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
