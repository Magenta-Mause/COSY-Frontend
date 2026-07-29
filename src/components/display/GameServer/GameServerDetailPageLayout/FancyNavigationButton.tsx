import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

const buttonStyles = {
  padding: "25px",
};

const SIDE_MARGIN = 15;

const FancyNavigationButton = (
  props: {
    isActive: boolean;
    label: ReactNode;
    children: ReactNode;
    direction?: "left" | "right";
    disabled?: boolean;
    variant?: "primary" | "secondary";
  } & ComponentProps<"button">,
) => {
  const { isActive, label, children, direction, disabled, ...buttonProps } = props;
  const compiledDirection = direction ?? "left";
  const compiledMargin = compiledDirection === "left" ? "mr" : "ml";

  // Calculate max-width based on label length (approximately 5px per character)
  const labelLength = typeof label === "string" ? label.length : 20;
  const calculatedMaxWidth = labelLength * 13;

  return (
    <Button
      style={buttonStyles}
      tabIndex={-1}
      {...buttonProps}
      variant={props.variant ?? "primary"}
      disabled={disabled}
      className={cn(
        isActive
          ? !props.variant || props.variant === "primary"
            ? "bg-button-primary-active!"
            : "bg-button-secondary-click!"
          : "",
        "gap-0",
        "transition-all duration-300",
        disabled && "cursor-not-allowed opacity-50",
        buttonProps.className,
      )}
    >
      {compiledDirection === "right" && children}
      <div
        className={cn(
          // Only apply hover/focus effects when NOT disabled
          !disabled && `group-focus:${compiledMargin}-1 group-focus:opacity-100`,
          !disabled && `group-hover:${compiledMargin}-1 group-hover:opacity-100`,
          !disabled &&
            "group-hover:max-w-(--label-max-width) group-focus:max-w-(--label-max-width)",
          // Base classes always apply
          "top-[50%] max-w-0 opacity-0 duration-400 transition-all",
          `align-middle justify-center m-auto relative ${compiledMargin}-0 overflow-clip`,
        )}
        style={{
          transform:
            "translateX(" +
            (compiledDirection === "left" ? "-" : "") +
            SIDE_MARGIN +
            "px) translateY(-50%)",
          ["--label-max-width" as string]: `${calculatedMaxWidth}px`,
        }}
      >
        {label}
      </div>
      {compiledDirection === "left" && children}
    </Button>
  );
};

export default FancyNavigationButton;
