import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { MotionCard } from "./motion-card";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  suffix,
  delta,
  hint,
  accent = "sage",
  icon,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  delta?: string;
  hint?: string;
  accent?: "sage" | "blush" | "fear" | "greed";
  icon?: React.ReactNode;
}) {
  const isNumber = typeof value === "number";
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());

  useEffect(() => {
    if (isNumber) {
      const c = animate(mv, value as number, { duration: 1.1, ease: "easeOut" });
      return c.stop;
    }
  }, [isNumber, value, mv]);

  const accentVar = `var(--${accent})`;

  return (
    <MotionCard interactive className="overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            {isNumber ? (
              <motion.span className="font-display text-3xl font-semibold tracking-tight">
                {rounded}
              </motion.span>
            ) : (
              <span className="font-display text-3xl font-semibold tracking-tight">{value}</span>
            )}
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{
            backgroundColor: `color-mix(in oklab, ${accentVar} 18%, transparent)`,
            color: accentVar,
          }}
        >
          {icon}
        </div>
      </div>
      {delta && (
        <span
          className={cn(
            "mt-4 inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/50 px-2 py-1 text-[11px]",
          )}
          style={{ color: accentVar }}
        >
          {delta}
        </span>
      )}
    </MotionCard>
  );
}
