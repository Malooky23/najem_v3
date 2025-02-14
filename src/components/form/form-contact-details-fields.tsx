"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormInputField } from "./form-input-field";
import { FormSelectField } from "./form-select-field";
import { FormSwitchField } from "./form-switch-field";
import { Button } from "../ui/button";
import { Plus, Trash2 } from "lucide-react";

interface FormContactDetailsFieldsProps {
  form: UseFormReturn<any>;
  prefix?: string;
}

export function FormContactDetailsFields({
  form,
  prefix = "contactDetails",
}: FormContactDetailsFieldsProps) {
  const [contactCount, setContactCount] = useState(1);

  const contactTypes = [
    { value: "email", label: "Email" },
    { value: "mobile", label: "Mobile" },
    { value: "landline", label: "Landline" },
    { value: "other", label: "Other" },
  ];

  const addContact = () => {
    const currentContacts = form.getValues(prefix) || [];
    form.setValue(prefix, [
      ...currentContacts,
      { contactType: "email", contactData: "", isPrimary: false },
    ]);
    setContactCount((prev) => prev + 1);
  };

  const removeContact = (index: number) => {
    const currentContacts = form.getValues(prefix) || [];
    form.setValue(
      prefix,
      currentContacts.filter((_, i) => i !== index)
    );
    setContactCount((prev) => prev - 1);
  };

  return (
    <div className="space-y-4 scrollable">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Contact Details</h3>
      </div>

      {Array.from({ length: contactCount }).map((_, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <div className="flex justify-between items-start">
            <div className="space-y-4 flex-1">
              <FormSelectField
                form={form}
                name={`${prefix}.${index}.contactType`}
                label="Type"
                options={contactTypes}
              />
              <FormInputField
                form={form}
                name={`${prefix}.${index}.contactData`}
                label="Contact"
              />
              <FormSwitchField
                form={form}
                name={`${prefix}.${index}.isPrimary`}
                label="Primary Contact"
              />
            </div>
            {contactCount > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeContact(index)}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
              <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addContact}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Contact
        </Button>
    </div>
  );
}
