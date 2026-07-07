import { cn } from "@/lib/cn";

/**
 * JanSetu AI logo — an Ashoka-Chakra-inspired civic mark in the national
 * tricolor. Deliberately NOT the State Emblem of India (which is legally
 * restricted); this is an original chakra-and-bridge motif.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 48 48"
        width="32"
        height="32"
        role="img"
        aria-label="JanSetu AI"
        className="shrink-0"
      >
        <circle cx="24" cy="24" r="22" fill="#fff" stroke="#e5e7eb" />
        <path d="M4 24a20 20 0 0 1 40 0" fill="none" stroke="#FF9933" strokeWidth="4" />
        <path d="M44 24a20 20 0 0 1-40 0" fill="none" stroke="#138808" strokeWidth="4" />
        <circle cx="24" cy="24" r="9" fill="none" stroke="#000080" strokeWidth="1.6" />
        <circle cx="24" cy="24" r="1.6" fill="#000080" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <line
              key={i}
              x1={24 + Math.cos(a) * 2}
              y1={24 + Math.sin(a) * 2}
              x2={24 + Math.cos(a) * 9}
              y2={24 + Math.sin(a) * 9}
              stroke="#000080"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Jan<span className="text-saffron">Setu</span>{" "}
          <span className="text-navy">AI</span>
        </span>
      )}
    </span>
  );
}
