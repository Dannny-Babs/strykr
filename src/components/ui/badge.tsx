import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-[26px] w-fit shrink-0 items-center justify-center gap-[5px] overflow-hidden rounded-md px-2.5 text-xs leading-4 font-medium whitespace-nowrap tabular-nums transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/40 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-3 aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-neutral-soft text-neutral",
        secondary: "bg-neutral-soft text-neutral",
        destructive: "bg-danger-soft text-danger-foreground",
        success: "bg-success-soft text-success-foreground",
        warning: "bg-warning-soft text-warning-foreground",
        info: "bg-info-soft text-info-foreground",
        violet: "bg-violet-soft text-violet-foreground",
        outline: "bg-neutral-soft text-neutral",
        ghost: "bg-transparent text-neutral hover:bg-muted",
        link: "bg-transparent text-foreground underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
