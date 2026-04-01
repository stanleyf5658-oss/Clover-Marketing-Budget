"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    
    // Explicitly cast to unknown then HTMLMotionProps to satisfy TS
    const motionProps = props as unknown as HTMLMotionProps<"button">;

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "inline-flex items-center justify-center rounded-[8px] px-6 py-3 text-[15px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:pointer-events-none disabled:bg-gray-200 disabled:text-text-muted",
          variant === "primary" && "bg-primary text-white hover:bg-primary-hover shadow-md",
          variant === "secondary" && "bg-transparent border border-primary text-primary hover:bg-branding-row",
          variant === "ghost" && "bg-transparent text-text-muted hover:text-text-main",
          className
        )}
        {...motionProps}
      />
    );
  }
)
Button.displayName = "Button"

export { Button }
