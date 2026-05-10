import { motion } from "framer-motion";
import { moodColor, type Mood } from "@/lib/mock";
import { cn } from "@/lib/utils";

export function MoodChip({
  mood,
  selected,
  onClick,
  size = "md",
}: {
  mood: Mood;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}) {
  const color = moodColor[mood];
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
        selected
          ? "border-foreground/30 bg-foreground/5 text-foreground"
          : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {mood}
    </motion.button>
  );
}
