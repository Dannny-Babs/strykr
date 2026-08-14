import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full min-w-0 rounded-lg border border-input bg-card text-[13px] leading-4 text-foreground transition-[border-color,box-shadow,background-color] outline-none hover:border-input-hover file:inline-flex file:border-0 file:bg-transparent file:text-[13px] file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15",
  {
    variants: {
      controlSize: {
        sm: "h-10 px-3 file:h-8",
        default: "h-10 px-3 file:h-8",
        lg: "h-10 px-3 file:h-8",
      },
    },
    defaultVariants: {
      controlSize: "default",
    },
  }
)

function Input({
  className,
  type,
  controlSize = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={controlSize}
      className={cn(inputVariants({ controlSize }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
