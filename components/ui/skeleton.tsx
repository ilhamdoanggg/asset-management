import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-shimmer rounded-md bg-muted bg-[linear-gradient(100deg,transparent_20%,color-mix(in_oklch,var(--muted-foreground)_14%,transparent)_50%,transparent_80%)] bg-[length:200%_100%] motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
