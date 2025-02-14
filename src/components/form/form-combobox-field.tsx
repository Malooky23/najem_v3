"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control, Path } from "react-hook-form";
import { FieldValues } from "react-hook-form";

interface Option {
  label: string;
  value: string;
}

interface FormComboboxFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  options: Option[];
}

export function FormComboboxField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required,
  options = [],
}: FormComboboxFieldProps<TFieldValues>) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive"> *</span>}
            </FormLabel>
          )}
          <Popover modal={true} open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? options.find(
                        (option) => option.value === field.value
                      )?.label
                    : placeholder || "Select option"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent 
              className="w-full p-0"
              style={{
                zIndex: 9999,
              }}
              side="bottom"
              align="start"
              sideOffset={4}
              alignOffset={0}
              avoidCollisions={true}
            //   portal={true}
            >
              <Command 
                shouldFilter={false}
                className="max-h-[300px]"
              >
                <CommandInput
                  placeholder={`Search ${label?.toLowerCase()}...`}
                  value={inputValue}
                  onValueChange={setInputValue}
                />
                <CommandList className="max-h-[200px] overflow-y-auto">
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {options
                      .filter((option) =>
                        option.label
                          .toLowerCase()
                          .includes(inputValue.toLowerCase())
                      )
                      .map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => {
                            field.onChange(option.value);
                            setInputValue("");
                            setOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              option.value === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 

