import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type Props = HTMLMotionProps<"div"> & { interactive?: boolean };

export const MotionCard = forwardRef<HTMLDivElement, Props>(
  ({ className, interactive, children, ...rest }, ref) => (
    <motion.div
      ref={ref}
      whileHover={interactive ? { y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "relative rounded-2xl border border-border/60 bg-card/60 p-5 shadow-soft backdrop-blur-xl",
        interactive && "hover:border-border transition-colors",
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  )
);
MotionCard.displayName = "MotionCard";
