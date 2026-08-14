import { cn } from "@/lib/utils";

type SectionLabelProps = {
  index?: string;
  label: string;
  right?: string;
  onDark?: boolean;
};

export function SectionLabel({ index, label, right, onDark }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between border-t pt-4 font-mono text-[11px] tracking-[0.14em] uppercase",
        onDark ? "border-white/15 text-white/50" : "border-border text-muted-foreground",
      )}
    >
      <span>
        {index ? `[${index}] ` : ""}
        {label}
      </span>
      {right ? <span className="hidden sm:block">/ {right}</span> : null}
    </div>
  );
}

type SectionHeadingProps = {
  index?: string;
  eyebrow?: string;
  eyebrowRight?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  onDark?: boolean;
  className?: string;
};

export function SectionHeading({
  index,
  eyebrow,
  eyebrowRight,
  title,
  description,
  align = "left",
  onDark,
  className,
}: SectionHeadingProps) {
  return (
    <div className={className}>
      {eyebrow ? (
        <SectionLabel
          index={index}
          label={eyebrow}
          right={eyebrowRight}
          onDark={onDark}
        />
      ) : null}
      <div
        className={cn(
          align === "center" && "mx-auto max-w-3xl text-center",
          align === "left" && "max-w-3xl",
          eyebrow && "mt-10",
        )}
      >
        <h2
          className={cn(
            "font-display text-4xl leading-[1.05] font-normal tracking-[-0.02em] text-balance sm:text-5xl",
            onDark ? "text-[oklch(0.96_0.004_85)]" : "text-foreground",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-5 max-w-xl text-[15px] leading-relaxed font-light text-pretty",
              align === "center" && "mx-auto",
              onDark ? "text-white/60" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
