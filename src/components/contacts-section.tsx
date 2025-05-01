"use client"

import { Mail, Phone, Trash2, Plus, Star } from "lucide-react"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label" // Keep Label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import type { FieldArrayWithId, Control, UseFormSetValue, UseFormWatch, FormState } from "react-hook-form"
import { z } from "zod"
import { contactSchema, contactsArraySchema } from "@/lib/validations/contact"
import { cn } from "@/lib/utils"
import { FieldValues, Path, PathValue, UseFieldArrayAppend, FieldError, FieldErrorsImpl, Merge, ArrayPath, DeepMap, DeepRequired, UseFieldArrayReturn } from "react-hook-form"; // Import necessary types
import { ContactDetailsSchema } from "@/types/common"; // Import the specific schema

export const CONTACT_TYPE_OPTIONS = [
    { value: "email" as const, label: "Email" },
    { value: "phone" as const, label: "Phone" },
    { value: "mobile" as const, label: "Mobile" }

  ] as const;

type ContactType = (typeof CONTACT_TYPE_OPTIONS)[number]["value"]

// Define the specific form shape expected by this component
type ContactsFormShape = {
  contacts: z.infer<typeof ContactDetailsSchema>[];
}

const contactValidation = {
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email address',
  phone: (value: string) => /^\+?[\d\s-]{7,}$/.test(value) || 'Invalid phone number'
};

// Use the specific ContactsFormShape for props
type ContactsSectionProps = {
  // Use a generic FieldValues type, assuming the parent form has a 'contacts' field
  fields: FieldArrayWithId<ContactsFormShape, "contacts", "id">[]
  append: UseFieldArrayAppend<ContactsFormShape, "contacts">
  remove: (index: number) => void
  setValue: UseFormSetValue<ContactsFormShape>
  watch: UseFormWatch<ContactsFormShape>
  formState: FormState<ContactsFormShape>
  control: Control<ContactsFormShape>
}

export function ContactsSection({ fields, append, remove, setValue, watch, formState, control }: ContactsSectionProps) { // Remove generic
  const detectContactType = useCallback((value: string): ContactType | "other" => { // Allow 'other' if needed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^\+?[\d\s-]{7,}$/

    if (emailRegex.test(value)) return "email"
    if (phoneRegex.test(value)) return "phone"
    return "email" // Default to email if detection fails or add "other" logic
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Label>Contact Information <span className="text-red-500">*</span></Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({
            contactData: "", // Use contactData
            contactType: "email", // Use contactType
            isPrimary: fields.length === 0, // Make first one primary by default
            // Add required defaults from ContactDetailsSchema
            contactDetailsId: crypto.randomUUID(),
            createdAt: new Date(),
            // Add other required fields from ContactDetailsSchema if necessary, e.g., createdAt, updatedAt with defaults
          } as any)} // Use 'as any' for simplicity or create a specific default object type
          className="h-8 px-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add contact
        </Button>
      </div>

      {/* <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1"> */}
      <div className="space-y-3 overflow-y-auto pr-1 ">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className={cn(
              "p-3 rounded-md relative transition-all",
              watch(`contacts.${index}.isPrimary` as any) // Use 'as any' or ensure path is correct
                ? "bg-green-400/5 border border-green-400"
                : "bg-card border"
            )}
          >
            {/* {watch(`contacts.${index}.isPrimary`) && (
              // <Badge variant="secondary" className="absolute -top-2 -right-2 text-[10px]">
              //   Primary
              // </Badge>
              <Star className="absolute -top-2 -right-1 stroke-amber-400"/>
            )} */}

            <div className="space-y-3">
              {/* Contact input with icon */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {watch(`contacts.${index}.contactType` as any) === "email" ? ( // Use contactType
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <Input
                  {...control.register(`contacts.${index}.contactData` as any, { // Use contactData
                    required: "Contact information is required",
                  })}
                  onChange={(e) => {
                    control.register(`contacts.${index}.contactData` as any).onChange(e); // Use contactData
                    const type = detectContactType(e.target.value);
                    setValue(`contacts.${index}.contactType`, type as any); // Use specific path
                  }}
                  placeholder="email@example.com or +1234567890"
                  className="pl-10"
                />
                {/* Access the specific error for the contactData field within the indexed contact error object */}
                {formState.errors.contacts?.[index]?.contactData && (
                  <p className="text-xs text-red-500 mt-1">
                    {/* Safer access to nested error message */}
                    {formState.errors.contacts?.[index]?.contactData?.message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 items-center sm:flex-nowrap">
                {/* Contact type selector */}
                <div className="w-full sm:w-auto">
                  <Select
                    value={watch(`contacts.${index}.contactType` as any)} // Use contactType
                    onValueChange={(value: ContactType) =>
                      setValue(`contacts.${index}.contactType`, value as any) // Use specific path
                    }
                  >
                    <SelectTrigger className="w-full sm:w-[120px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Primary toggle and delete button */}
                <div className="flex items-center justify-between w-full sm:justify-start sm:ml-auto gap-3">
                  <div className="flex items-center space-x-1.5">
                    <Switch
                      checked={watch(`contacts.${index}.isPrimary` as any)} // Use 'as any' or ensure path is correct
                      onCheckedChange={(checked) => {
                        fields.forEach((_, i) => {
                          setValue(`contacts.${i}.isPrimary`, i === index && checked); // Use specific path
                        });
                      }}
                      className="h-5 w-9 data-[state=checked]:bg-amber-300"
                    />
                    <Label className="text-xs font-medium">Primary</Label>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fields.length > 1 && remove(index)}
                    disabled={fields.length === 1}
                    className="h-8 w-8 p-0 ml-auto rounded-full hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 stroke-destructive" />
                    <span className="sr-only">Delete contact</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Check if root error exists and display its message */}
            {index === 0 && formState.errors.contacts && typeof formState.errors.contacts === 'object' && !Array.isArray(formState.errors.contacts) && 'root' in formState.errors.contacts && (formState.errors.contacts.root as FieldError)?.message && (
              <p className="text-xs text-red-500 mt-1">
                {/* Safer access to root error message */}
                {(formState.errors.contacts.root as FieldError)?.message}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}