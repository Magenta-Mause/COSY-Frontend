import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface InputProps extends React.ComponentProps<"input"> {
  header?: string | React.ReactNode;
  description?: string | React.ReactNode;
  startDecorator?: React.ReactNode;
  endDecorator?: string | React.ReactNode;
  error?: string | React.ReactNode;
  wrapperClassName?: string;
  submitButtonLabel?: string;
  onSubmit?: () => void;
  submitDisabled?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({
                                                                              className,
                                                                              type,
                                                                              header,
                                                                              description,
                                                                              endDecorator,
                                                                              startDecorator,
                                                                              error,
                                                                              wrapperClassName,
                                                                              submitButtonLabel,
                                                                              onSubmit,
                                                                              submitDisabled,
                                                                              ...props
                                                                            }: InputProps, ref) {
  const startDecoratorRef = React.useRef<HTMLDivElement>(null);
  const [startPadding, setStartPadding] = React.useState<number>(0);

  React.useLayoutEffect(() => {
    if (startDecorator && startDecoratorRef.current) {
      const width = startDecoratorRef.current.offsetWidth;
      setStartPadding(width + 16); // 8px buffer on each side
    } else {
      setStartPadding(0);
    }
  }, [startDecorator]);

  return (
    <div className={wrapperClassName}>
      {header && (
        <Label htmlFor={props.id} className="pb-2 font-bold">
          {header}
        </Label>
      )}

      <div className={cn("flex gap-2", submitButtonLabel ? "items-start" : "")}>
        <div className="flex relative w-full flex-1">
          {startDecorator && (
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground z-10">
              {startDecorator}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            data-slot="input"
            className={cn(
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:opacity-50 md:text-md",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
              "bg-primary-banner [box-shadow:inset_0_1px_2px_rgba(132,66,57,0.4)] no-spinner",
              startDecorator && "pl-10",
              endDecorator && "pr-10",
              error && "border-destructive",
              className
            )}
            style={{
              paddingLeft: startPadding ? `${startPadding}px` : undefined,
            }}
            aria-invalid={error ? true : undefined}
            {...props}
          />

          {endDecorator && (
            <div className="absolute inset-y-0 right-3 flex items-center text-base text-muted-foreground">
              {endDecorator}
            </div>
          )}
        </div>

        {submitButtonLabel && onSubmit && (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            className="h-9"
          >
            {submitButtonLabel}
          </Button>
        )}
      </div>

      {description && (
        <Label htmlFor={props.id} className="pt-2 text-muted-foreground">
          {description}
        </Label>
      )}
      {error && (
        <div className="text-destructive pt-2 text-sm">
          {error}
        </div>
      )}
    </div>
  );
});

export { Input };
