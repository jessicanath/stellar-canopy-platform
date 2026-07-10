import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "stellar";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 active:scale-98 disabled:pointer-events-none disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-stellar-blue/50",
          {
            // Primary green
            "bg-stellar-green hover:bg-stellar-green/90 text-white shadow-lg shadow-stellar-green/20":
              variant === "primary",
            // Secondary purple/navy
            "bg-stellar-purple hover:bg-stellar-purple/90 text-white shadow-lg shadow-stellar-purple/20":
              variant === "secondary",
            // Outline
            "border border-white/10 bg-transparent hover:bg-white/5 text-white":
              variant === "outline",
            // Ghost
            "bg-transparent hover:bg-white/5 text-white": variant === "ghost",
            // Danger
            "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20":
              variant === "danger",
            // Stellar brand gradient
            "bg-gradient-to-r from-stellar-cyan via-stellar-blue to-stellar-purple text-white shadow-lg hover:brightness-110 hover:shadow-stellar-blue/30":
              variant === "stellar",
          },
          {
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 width-4 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
