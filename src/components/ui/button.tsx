import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base Styles: Converted gap, font-size, icon sizes, and focus rings to [vw]
  "inline-flex items-center justify-center gap-[0.5vw] whitespace-nowrap text-[0.9vw] font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[1vw] shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[0.2vw] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-button text-primary-modal-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-[0.4vw]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 rounded-[0.4vw]",
        outline:
          "border-[0.1vw] border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-[0.4vw]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-[0.4vw]",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 rounded-[0.4vw]",
        link: "text-primary underline-offset-[0.2vw] hover:underline",
        stardewDark: [
          "font-['VT323'] text-[#5c1b0c] uppercase text-xl text-primary-modal-background",
          "bg-button bg-[image:linear-gradient(to_right,transparent_50%,rgba(92,27,12,0.1)_50%),linear-gradient(to_bottom,transparent_50%,rgba(92,27,12,0.1)_50%)] bg-[length:0.25vw_0.25vw]",
          "border-none !rounded-none shadow-[inset_0.2vw_0.2vw_0_#eab678,inset_-0.2vw_-0.2vw_0_#a35d29,0_0_0_0.2vw_#5c1b0c]",
          "hover:brightness-110 hover:scale-[1.02]",
          "active:scale-95 active:translate-y-[0.2vw] active:shadow-[inset_0.2vw_0.2vw_0_#a35d29,inset_-0.2vw_-0.2vw_0_#eab678,0_0_0_0.2vw_#5c1b0c]",
        ],
        // --- STARDEW VARIANT (Fully Scalable VW) ---
        stardew: [
          // Typography: Uses your custom font family + fallback
          "font-['VT323'] text-[#5c1b0c] uppercase text-xl",

          // Base & Texture: The wood grain dots now scale with screen width
          "bg-[#d98c39] bg-[image:linear-gradient(to_right,transparent_50%,rgba(92,27,12,0.1)_50%),linear-gradient(to_bottom,transparent_50%,rgba(92,27,12,0.1)_50%)] bg-[length:0.25vw_0.25vw]",

          // Borders: Calculated using shadow to get sharp pixel corners
          // Using 0.2vw (~3-4px on 1920px screen) for thickness
          "border-none !rounded-none shadow-[inset_0.2vw_0.2vw_0_#eab678,inset_-0.2vw_-0.2vw_0_#a35d29,0_0_0_0.2vw_#5c1b0c]",

          // Hover Effects
          "hover:brightness-110 hover:scale-[1.02]",

          // Active (Pressed) Effects
          // Invert shadows and translate Y by the border thickness
          "active:scale-95 active:translate-y-[0.2vw] active:shadow-[inset_0.2vw_0.2vw_0_#a35d29,inset_-0.2vw_-0.2vw_0_#eab678,0_0_0_0.2vw_#5c1b0c]",
        ].join(" "),
      },
      size: {
        // Standard Sizes converted to vw
        default: "h-[2.25vw] px-[1vw] py-[0.5vw] has-[>svg]:px-[0.75vw]",
        sm: "h-[2vw] rounded-[0.3vw] gap-[0.35vw] px-[0.75vw] has-[>svg]:px-[0.6vw] text-[0.8vw]",
        lg: "h-[2.5vw] rounded-[0.4vw] px-[1.5vw] has-[>svg]:px-[1vw] text-[1vw]",

        // Icons
        icon: "h-[2.25vw] w-[2.25vw]",
        "icon-sm": "h-[2vw] w-[2vw]",
        "icon-lg": "h-[2.5vw] w-[2.5vw]",

        // Stardew Specific Size (Slightly taller)
        "stardew-def": "h-[3.5vw] px-[1vw] py-[0.5vw]",
      },
    },
    defaultVariants: {
      variant: "stardew",
      size: "stardew-def",
    },
  },
);

function Button({
                  className,
                  variant,
                  size,
                  asChild = false,
                  ...props
                }: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
