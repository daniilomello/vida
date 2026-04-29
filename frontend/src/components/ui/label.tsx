import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is provided by the caller
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none text-white",
          "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className,
        )}
        {...props}
      />
    );
  },
);
Label.displayName = "Label";

export { Label };
