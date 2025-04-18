
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Check, ChevronsUpDown } from "lucide-react"
import { useForm, UseFormSetValue } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
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
import { useState } from "react"

interface ComboboxPopoverProps<T extends string> {
  options: { label: string; value: T }[];
  value: T | undefined;
  setValue: UseFormSetValue<any>;
  fieldName: string;
  placeholder: string;
}

function ComboboxPopover<T extends string>({
  options,
  value,
  setValue,
  fieldName,
  placeholder,
}: ComboboxPopoverProps<T>) {
  const [ open, setOpen ] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-[200px] justify-between",
              !value && "text-muted-foreground"
            )}
          >
            {value
              ? options.find((option) => option.value === value)?.label
              : placeholder}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            className="h-9"
          />
          <CommandList >
            <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (

                <CommandItem
                  value={option.label}
                  key={option.value}
                  onSelect={() => {
                    setValue(fieldName, option.value);
                    setOpen(false); // Close the popover after selection
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>

              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const languages = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Chinese", value: "zh" },
  { label: "1English", value: "1English" },
  { label: "1French", value: "1French" },
  { label: "1German", value: "1German" },
  { label: "1Spanish", value: "1Spanish" },
  { label: "1Portuguese", value: "1Portuguese" },
  { label: "1Russian", value: "1Russian" },
  { label: "1Japanese", value: "1Japanese" },
  { label: "1Korean", value: "1Korean" },
  { label: "1Chinese", value: "1Chinese" },
  { label: "2English", value: "2English" },
  { label: "2French", value: "2French" },
  { label: "2German", value: "2German" },
  { label: "2Spanish", value: "2Spanish" },
  { label: "2Portuguese", value: "2Portuguese" },
  { label: "2Russian", value: "2Russian" },
  { label: "2Japanese", value: "2Japanese" },
  { label: "2Korean", value: "2Korean" },
  { label: "2Chinese", value: "2Chinese" },
];

const FormSchema = z.object({
  language: z.string({
    required_error: "Please select a language.",
  }),
  FromComponents: z.string({
    required_error: "Please select a language.",
  }),

});

import { ComboboxForm as ComboboxFormComponent } from "@/components/ui/combobox"
import { set } from "date-fns"
import testAction from "./action"

import { CreateCustomerDialog } from "./customers/CreateCustomerForm"
import Link from "next/link"
import { DropdownDialogDemo } from "./DropdownDialogDemo"
import { OrderDetailsContainer } from "../../warehouse/orders/components/order-details/OrderDetailsContainer"


export function ComboboxForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    testAction(data)
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(onSubmit)();
        setTimeout(() => {
          form.reset();
        }
          , 1000);
      }} className="space-y-6">
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Language</FormLabel>
              <ComboboxPopover
                options={languages}
                value={field.value}
                setValue={form.setValue}
                fieldName="language"
                placeholder="Select language"
              />
              <FormDescription>
                This is the language that will be used in the dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="FromComponents"
          render={({ field }) => (
            <ComboboxFormComponent
              name="FromComponents"
              options={languages}
              value={field.value}
              onChange={(value) => form.setValue(field.name, value)}
            />
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form >
  );
}

export default function ExperimentsPage() {
  return (
    <div className=" bg-red-50/50  gap-4 flex flex-col justify-center h-[100%] m-4  items-center ">
      <h1 className="text-2xl font-bold mb-4"> Test Page</h1>
      {/* <ComboboxForm /> */}



      <CreateCustomerDialog />

      <div className="flex ">
        <div className="flex">
          <h1>Dropdown with Dialog </h1>
          <ArrowRight />
        </div>
        <DropdownDialogDemo />
      </div>
      <OrderDetailsContainer
        // orderId={store.selectedOrderId}
        isMobile={false}
      />
    </div>
  );
}