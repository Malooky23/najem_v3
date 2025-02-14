"use client";

import { UseFormReturn, Control } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormControl } from "@/components/ui/form";

interface FormSwitchFieldProps {
  control: Control<any>;
  form: UseFormReturn<any>;
  name: string;
  label: string;
}

// export function FormSwitchField({ control, form, name, label }: FormSwitchFieldProps) {
//   return (
//     <FormField
//       control={form.control}
//       name={name}
//       render={({ field }) => (
//         <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
//           <div className="space-y-0.5">
//             <Label>{label}</Label>
//           </div>
//           <FormControl>
//             <Switch
//               checked={field.value}
//               onCheckedChange={field.onChange}
//             />
//           </FormControl>
//         </FormItem>
//       )}
//     />
//   );
// }

export function FormSwitchField({ control, form, name, label }: FormSwitchFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center space-x-2">
          <div className="space-y-0.5">
            <Label className="text-sm">{label}</Label>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className="h-4 w-8" // Adjust the size of the switch
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}