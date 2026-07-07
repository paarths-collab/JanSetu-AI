import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "green";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron/50";
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
  };
  const variants = {
    primary: "bg-saffron text-white hover:bg-saffron-dark shadow-sm",
    green: "bg-green text-white hover:brightness-110 shadow-sm",
    outline: "border border-border bg-white text-foreground hover:bg-surface",
    ghost: "text-foreground hover:bg-surface",
  };
  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-0", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

type BadgeTone = "saffron" | "green" | "navy" | "gray";

export function Badge({
  tone = "gray",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  const tones: Record<BadgeTone, string> = {
    saffron: "bg-saffron/10 text-saffron-dark",
    green: "bg-green/10 text-green",
    navy: "bg-navy/10 text-navy",
    gray: "bg-surface text-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      aria-hidden
    />
  );
}
