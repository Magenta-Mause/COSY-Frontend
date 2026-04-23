import type {MouseEventHandler, ReactNode} from "react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@components/ui/tooltip.tsx";

interface TooltipWrapperProps {
  children?: ReactNode;
  tooltip: string | ReactNode | false | null | undefined;
  asChild?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerProps?: React.ComponentProps<typeof TooltipTrigger>;
  onClick?: MouseEventHandler<HTMLDivElement>;
  delayDuration?: number;
}

const TooltipWrapper = ({
  children,
  tooltip,
  asChild = true,
  side,
  align = "center",
  contentClassName,
  open,
  onOpenChange,
  triggerProps = {},
  onClick,
  delayDuration,
}: TooltipWrapperProps) => {
  // If tooltip is falsy, just return children without tooltip wrapper
  if (!tooltip) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip open={open} onOpenChange={onOpenChange}>
        <TooltipTrigger asChild={asChild} {...triggerProps}>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className={contentClassName} onClick={onClick}>
          {typeof tooltip === "string" ? <p className="whitespace-pre-line">{tooltip}</p> : tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipWrapper;
