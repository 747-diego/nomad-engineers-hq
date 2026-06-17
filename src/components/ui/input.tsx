import * as React from "react";
import { cn } from "@/lib/utils";

// shadcn/ui Input, restyled: sharp edges, DM Mono, green focus ring.
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-none border border-input bg-transparent px-3 py-2 font-mono text-sm text-foreground transition-colors placeholder:text-nomad-muted-gray focus-visible:border-nomad-green focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nomad-green disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
