"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useState } from "react"


interface Option {
  label: string
  value: string
}

export interface ComboboxProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  required?: boolean
  isModal?: boolean
}

function ComboboxContent({ field, form, options, label, placeholder, disabled, onChange }: {
  field: any
  form: any
  options: Option[]
  label?: string
  placeholder?: string
  disabled?: boolean
  onChange?: (value: string) => void
}) {
  return (
    <Command>
      <CommandInput
        placeholder={`Search ${label?.toLowerCase() ?? "option"}...`}
        className="h-9"
      />

        <CommandList >
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup >
            {options.map((option) => (
              <CommandItem
                value={option.value}  // Changed from option.label to option.value
                key={option.value}
                onSelect={() => {
                  form.setValue(field.name, option.value)
                  onChange?.(option.value)
                }}
              >
                {option.label}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    option.value === field.value
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
    </Command>
  )
}

export function ComboboxForm({
  name,
  label,
  description,
  placeholder = "Select an option...",
  options,
  value,
  onChange,
  className,
  isModal,
  disabled = false,
  required = false,
}: ComboboxProps) {
  const form = useFormContext()

  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [open, setOpen] = useState(false)

  function doo(value: string){
    setOpen(false)
    if (value && onChange) {
      onChange(value)
    }
  }

  return (
    // <Form {...form}>
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col gap-2", className)}>
          {label && (
            <FormLabel className="flex items-center gap-1">
              {label}
              {required && <span className="text-destructive">*</span>}
            </FormLabel>
          )}
          {isDesktop ? (
            <Popover open={open} onOpenChange={setOpen} modal={isModal} >
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between min-h-[2.5rem]",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? options.find(
                        (option) => option.value === field.value
                      )?.label
                      : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <ComboboxContent
                  field={field}
                  form={form}
                  options={options}
                  label={label}
                  placeholder={placeholder}
                  disabled={disabled}
                  onChange={doo}
                  
                />
              </PopoverContent>
            </Popover>
          ) : (
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                <FormControl>
                  <Button

                    variant="outline"
                    role="combobox"
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? options.find(
                        (option) => option.value === field.value
                      )?.label
                      : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mt-4 border-t ">
                  <ComboboxContent
                    field={field}
                    form={form}
                    options={options}
                    label={label}
                    placeholder={placeholder}
                    disabled={disabled}
                    onChange={doo}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          )}
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
    // </Form>
  )
}

