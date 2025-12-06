import * as React from "react"
import * as FormPrimitive from "@radix-ui/react-form"
import { cn } from "@/lib/utils"

function Form({
  ...props
}: React.ComponentProps<typeof FormPrimitive.Root>) {
  return <FormPrimitive.Root data-slot="form" {...props} />
}

function FormField({
  className,
  ...props
}: React.ComponentProps<typeof FormPrimitive.Field>) {
  return (
    <FormPrimitive.Field
      data-slot="form-field"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof FormPrimitive.Label>) {
  return (
    <FormPrimitive.Label
      data-slot="form-label"
      className={cn("text-2xl font-medium", className)}
      {...props}
    />
  )
}

function FormControl({
  className,
  ...props
}: React.ComponentProps<typeof FormPrimitive.Control>) {
  return (
    <FormPrimitive.Control
      data-slot="form-control"
      className={cn(
        "border-input bg-background ring-offset-background focus:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FormMessage({
  className,
  ...props
}: React.ComponentProps<typeof FormPrimitive.Message>) {
  return (
    <FormPrimitive.Message
      data-slot="form-message"
      className={cn("text-destructive text-xl", className)}
      {...props}
    />
  )
}

function FormSubmit({
  className,
  ...props
}: React.ComponentProps<typeof FormPrimitive.Submit>) {
  return (
    <FormPrimitive.Submit
      data-slot="form-submit"
      className={cn(
        "bg-button text-primary-modal-background hover:bg-button/70 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-2xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormSubmit,
}
