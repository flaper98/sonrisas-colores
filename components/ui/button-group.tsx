import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// 🔥 Utility para eliminar "ref" y evitar errores de TS en Next 14
function stripRef<T extends object>(props: T): Omit<T, "ref"> {
  const { ref, ...rest } = props as any;
  return rest;
}

const buttonGroupVariants = cva(
    "flex w-fit items-stretch [&>*]:focus-visible:z-10 [&>*]:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md has-[>[data-slot=button-group]]:gap-2",
    {
      variants: {
        orientation: {
          horizontal:
              "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
          vertical:
              "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
        },
      },
      defaultVariants: {
        orientation: "horizontal",
      },
    }
);

function ButtonGroup({
                       className,
                       orientation,
                       ...props
                     }: Omit<React.ComponentProps<"div">, "ref"> &
    VariantProps<typeof buttonGroupVariants>) {

  const safeProps = stripRef(props);

  return (
      <div
          role="group"
          data-slot="button-group"
          data-orientation={orientation}
          className={cn(buttonGroupVariants({ orientation }), className)}
          {...safeProps}
      />
  );
}

function ButtonGroupText({
                           className,
                           asChild = false,
                           ...props
                         }: Omit<React.ComponentProps<"div">, "ref"> & { asChild?: boolean }) {

  const safeProps = stripRef(props);
  const Comp = asChild ? Slot : "div";

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

function ButtonGroupSeparator({
                                className,
                                orientation = "vertical",
                                ...props
                              }: Omit<React.ComponentProps<typeof Separator>, "ref">) {

  const safeProps = stripRef(props);

  return (
      <Separator
          data-slot="button-group-separator"
          orientation={orientation}
          className={cn(
              "bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto",
              className
          )}
          {...safeProps}
      />
  );
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
