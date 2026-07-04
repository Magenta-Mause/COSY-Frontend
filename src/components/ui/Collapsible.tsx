import Icon from "@components/ui/Icon.tsx";
import { type ReactNode, useId, useState } from "react";
import arrowDownIcon from "@/assets/icons/arrowDown.webp";
import { cn } from "@/lib/utils.ts";

interface CollapsibleProps {
  title: ReactNode;
  description?: ReactNode;
  defaultOpen?: boolean;
  startDecorator?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Lightweight collapsible section in the project's New-York shadcn style. Uses a button trigger and
 * conditional content render (no extra radix dependency).
 */
const Collapsible = ({
  title,
  description,
  defaultOpen = false,
  startDecorator,
  className,
  children,
}: CollapsibleProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className={cn("rounded-xl border border-border/60 bg-foreground/[0.02]", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left cursor-pointer"
      >
        {startDecorator}
        <span className="flex flex-col min-w-0 flex-1">
          <span className="font-bold text-sm leading-snug">{title}</span>
          {description && (
            <span className="text-xs text-muted-foreground leading-snug">{description}</span>
          )}
        </span>
        <Icon
          src={arrowDownIcon}
          variant="foreground"
          className={cn("size-5 transition-transform duration-200", open ? "rotate-180" : "")}
        />
      </button>
      {open && (
        <div id={contentId} className="flex flex-col gap-4 px-4 pb-4 pt-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default Collapsible;
