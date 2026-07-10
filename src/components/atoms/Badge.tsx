import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "Sponsored" | "Planted" | "Verified";
}

export function Badge({ className, status, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors duration-300",
        {
          "bg-stellar-blue/10 text-stellar-blue border border-stellar-blue/30":
            status === "Sponsored",
          "bg-amber-500/10 text-amber-500 border border-amber-500/30":
            status === "Planted",
          "bg-stellar-green/10 text-stellar-green border border-stellar-green/30":
            status === "Verified",
        },
        className
      )}
      {...props}
    >
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", {
        "bg-stellar-blue": status === "Sponsored",
        "bg-amber-500": status === "Planted",
        "bg-stellar-green": status === "Verified",
      })} />
      {status}
    </div>
  );
}
