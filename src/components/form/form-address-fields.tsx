"use client";

import { FormInputField } from "./form-input-field";
import { UseFormReturn } from "react-hook-form";

interface FormAddressFieldsProps {
  form: UseFormReturn<any>;
  prefix?: string;
}

export function FormAddressFields({ form, prefix = "" }: FormAddressFieldsProps) {
  const getFieldName = (field: string) => prefix ? `${prefix}.${field}` : field;

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Address</h3>
      <div className="space-y-4">
        <FormInputField
          form={form}
          name={getFieldName("address1")}
          label="Address Line 1"
        />
        <FormInputField
          form={form}
          name={getFieldName("address2")}
          label="Address Line 2"
        />
        <div className="grid grid-cols-2 gap-4">
          <FormInputField
            form={form}
            name={getFieldName("city")}
            label="City"
            required
          />
          <FormInputField
            form={form}
            name={getFieldName("country")}
            label="Country"
            required
          />
        </div>
        <FormInputField
          form={form}
          name={getFieldName("postalCode")}
          label="Postal Code"
        />
      </div>
    </div>
  );
}
