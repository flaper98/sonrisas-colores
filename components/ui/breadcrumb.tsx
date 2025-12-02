import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

// Elimina "ref" de props para evitar conflictos con Slot o elementos dinámicos
function stripRef<T extends object>(props: T): Omit<T, "ref"> {
  const { ref, ...rest } = props as any;
  return rest;
}

interface ButtonGroupProps
    extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export function ButtonGroup({
                              className,
                              asChild,
                              ...props
                            }: ButtonGroupProps) {
  const Comp = asChild ? Slot : "div";

  // Remueve ref ANTES de propagar props
  const safeProps = stripRef(props);

  return (
      <Comp
          className={cn(
              "bg-muted flex items-center gap-2 rounded-md border px-4 text-sm font-medium shadow-xs [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
              className
          )}
          {...safeProps}
      />
  );
}
