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
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useState } from "react"
import { itemTypes } from "@/server/db/schema"
import { ItemSchemaType } from "@/types/items"


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
  enableFormMessage?: boolean
  itemClassName?: string
}

function ComboboxContent({ field, form, options, label, placeholder, disabled, onChange, itemClassName="" }: {
  field: any
  form: any
  options: Option[]
  label?: string
  placeholder?: string
  disabled?: boolean
  onChange?: (value: string) => void
  itemClassName?: string

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
                className={cn(option.value === field.value
                  ? "bg-slate-100"
                  : "",
                   itemClassName)}
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
  enableFormMessage = true,
  itemClassName = ""
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
                      "w-full justify-between min-h-[2.5rem] px-1",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate">{field.value
                      ? options.find(
                        (option) => option.value === field.value
                      )?.label
                      : placeholder}</span>
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
                  itemClassName={itemClassName}
                  
                />
              </PopoverContent>
            </Popover>
          ) : (
              <Drawer  open={open} onOpenChange={setOpen}>
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
                      <span className="truncate">{field.value
                        ? options.find(
                          (option) => option.value === field.value
                        )?.label
                        : placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </DrawerTrigger>
              <DrawerContent className="">
              {/* <DrawerContent className="mb-12"> */}
                  <DrawerHeader>
                    <DrawerTitle>
                      {/* NEEDED OTHERWISE WE GET ERRORS! */}
                    </DrawerTitle>
                  </DrawerHeader>
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
                {/* <div className="h-12 bg-amber-50 text-center text-gray-300">
                    <p>i added some space. /components/ui/combobox.tsx line 220</p>
                    <p>className="h-12 bg-amber-50 text-center</p>
                  </div> */}

              </DrawerContent>
            </Drawer>
          )}
          {description && <FormDescription>{description}</FormDescription>}
          {enableFormMessage && <FormMessage />}
        </FormItem>
      )}
    />
  )
}

