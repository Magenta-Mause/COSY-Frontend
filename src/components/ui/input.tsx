import type * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@components/ui/label";

interface InputProps extends React.ComponentProps<"input"> {
  header?: string;
}

function Input({ className, type, header, ...props }: InputProps) {
  return (
    <div>    
      {header && (
          <Label htmlFor={props.id} className="pb-2">
            {header}
          </Label>
        )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-md",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "bg-primary-banner [box-shadow:inset_0_1px_2px_rgba(132,66,57,0.4)] no-spinner",
          className
        )}
        {...props}
      />
    </div> 
  )
}

export { Input };
