import * as React from "react"
import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default"
}

function NativeSelect({
  className,
  size = "default",
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-full has-[select:disabled]:opacity-50",
        className
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          "peer h-9 w-full min-w-0 appearance-none rounded-lg border border-input bg-background/80 py-1.5 pr-8 pl-3 text-sm text-foreground shadow-xs transition-all outline-none select-none cursor-pointer",
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
          "hover:border-foreground/30 hover:bg-muted/30",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:bg-background",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          "data-[size=sm]:h-8 data-[size=sm]:py-1 data-[size=sm]:pl-2.5 data-[size=sm]:pr-7 data-[size=sm]:text-xs",
          "dark:bg-input/20 dark:hover:bg-input/40 dark:focus-visible:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
        )}
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground transition-transform duration-200 ease-out select-none peer-focus-visible:text-foreground peer-focus-visible:rotate-180 peer-hover:text-foreground group-has-[select[data-size=sm]]/native-select:right-2 group-has-[select[data-size=sm]]/native-select:size-3.5"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-popover text-popover-foreground py-1", className)}
      {...props}
    />
  )
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-popover text-popover-foreground font-semibold", className)}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
