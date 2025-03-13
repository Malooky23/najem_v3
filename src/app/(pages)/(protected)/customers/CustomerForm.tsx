import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { ContactsSection, type ContactFormData } from "@/components/contacts-section"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBusinessCustomer, createIndividualCustomer } from "./actions"
import { COUNTRIES } from "@/lib/constants/countries";
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useActionState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { contactsArraySchema, contactSchema } from "@/lib/validations/contact"
import { z } from 'zod'
import LocationSelector from "@/components/ui/location-input"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import AddressSection from "./AddressSection"

const businessCustomerSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  displayName: z.string().max(100, "Display name must be at most 100 characters"),
  country: z.string().min(1, "Country is required"),
  contacts: contactsArraySchema,
  notes: z.string().nullable().default(null)
})

const individualCustomerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  displayName: z.string().max(100, "Display name must be at most 100 characters"),
  personalId: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  contacts: contactsArraySchema,
  notes: z.string().nullable().default(null)
})

async function submitCustomerForm(prevState: any, formData: FormData, options: {
  type: "individual" | "business",
  form: any,
  isTaxRegistered: boolean,
  queryClient: any,
  toast: any,
  onClose: () => void
}) {
  const { type, form, isTaxRegistered, queryClient, toast, onClose } = options;

  try {
    const formObject: Record<string, any> = {};
    const addressFields: Record<string, string> = {};

    // Handle regular form data
    formData.forEach((value, key) => {
      if (!key.startsWith('contacts') && key !== 'isTaxRegistered') {
        if (key.startsWith('address.')) {
          const addressField = key.split('.')[1];
          addressFields[addressField] = value as string;
        } else {
          formObject[key] = value;
        }
      }
    });

    // Check if all address fields are empty
    const hasAddressData = Object.values(addressFields).some(value => value.trim() !== '');
    formObject.address = hasAddressData ? addressFields : null;

    // Handle taxNumber for business type
    if (type === 'business') {
      formObject.isTaxRegistered = isTaxRegistered;
      if (!isTaxRegistered) {
        formObject.taxNumber = null;
      }
    }

    // Add contacts from react-hook-form state
    const contacts = form.getValues('contacts');
    formObject.contacts = contacts.map((contact: { data: any; type: any; isPrimary: any }) => ({
      contact_data: contact.data,
      contact_type: contact.type,
      is_primary: contact.isPrimary
    }));

    if (formObject.country === '') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a country.",
      });
      return { error: "Select Country" };
    }

    let result;
    if (type === 'business') {
      result = await createBusinessCustomer(formObject);
    } else {
      result = await createIndividualCustomer(formObject);
    }

    if (result?.success === true) {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      onClose();
      toast({
        variant: "success",
        title: "New Customer Created!",
        description: "",
      });
      return { success: true, message: "Customer created successfully" };
    }

    return { error: "Failed to create customer" };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred."
    };
  }
}

export default function CustomerForm({ type, onClose }: { type: "individual" | "business" ; onClose: () => void }) {
  const [isTaxRegistered, setIsTaxRegistered] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [state, formAction, isPending] = useActionState(
    (prevState: any, formData: FormData) =>
      submitCustomerForm(prevState, formData, {
        type,
        form,
        isTaxRegistered,
        queryClient,
        toast,
        onClose
      }),
    null
  );

  const form = useForm<ContactFormData>({
    defaultValues: {
      contacts: [
        {
          data: "",
          type: "email" as const,
          isPrimary: true
        }
      ],
    },
    mode: "onChange",
    resolver: zodResolver(
      type === "business" ? businessCustomerSchema : individualCustomerSchema
    )
  });

  const { fields, append, remove } = useFieldArray<ContactFormData>({
    control: form.control,
    name: "contacts",
    rules: {
      required: "At least one contact is required",
      validate: (value) => {
        const hasPrimary = value.some((contact) => contact.isPrimary);
        if (!hasPrimary) return "At least one contact must be primary";
        return true;
      }
    }
  });

  const [selectedCountry, setSelectedCountry] = useState<any>(null)

  const handleCountryChange = (country: any) => {
    setSelectedCountry(country)
  }

  const [focusCountry, setFocusCountry] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    const formErrors = form.formState.errors;

    const hasContactData = form.watch('contacts').some(contact =>
      contact.data && contact.data.trim() !== '' &&
      contactSchema.safeParse({
        data: contact.data,
        type: contact.type,
        isPrimary: contact.isPrimary
      }).success
    );

    if (!selectedCountry) {
      e.preventDefault();
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a country.",
      });
      setFocusCountry(true)
      setTimeout(() => {
        setFocusCountry(false)
      }, 6000)
      return;
    }

    if (!hasContactData) {
      e.preventDefault();
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "At least one valid contact is required.",
      });
      return;
    }

    if (Object.keys(formErrors).length > 0) {
      e.preventDefault();
      const errorMessages = Object.entries(formErrors)
        .map(([field, error]) => `${field}: ${error.message}`)
        .join('\n');

      toast({
        variant: "destructive",
        title: "Validation Errors",
        description: "Please fix the following errors:\n" + errorMessages,
      });
      return;
    }
  };

  return (
    <form
      action={formAction}
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      {/* <div className="max-h-[80vh] flex-1 overflow-y-auto px-2 sm:px-4"> */}
      <div className="max-h-[65vh] flex-1 overflow-y-auto px-2 sm:px-4">
        <div className="space-y-4 pb-4 relative">
          {/* Add hidden input for country */}
          <input
            type="hidden"
            name="country"
            value={selectedCountry?.name || ''}
          />

          <div className="mb-4"></div>
            <Label htmlFor="displayName">Display Name <span className="text-red-500">*</span></Label>
            <Input id="displayName" name="displayName" placeholder="How the customer will appear in lists" required />
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            {type === "business" ? (
              <div>
                <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
                <Input id="businessName" name="businessName" placeholder="Company name" required />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input id="firstName" name="firstName" placeholder="First name" required />
                </div>
                <div>
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" name="middleName" placeholder="Middle name" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input id="lastName" name="lastName" placeholder="Last name" required />
                </div>
                <div>
                  <Label htmlFor="personalId">Personal ID</Label>
                  <Input id="personalId" name="personalId" placeholder="ID number" />
                </div>
              </div>
            )}
            
            <div className={cn("space-y-1", focusCountry ? "animate-flash-red border-2 border-red-500 p-2 rounded-md" : "")}>
              <Label>Location <span className="text-red-500">*</span></Label>
              <LocationSelector
                isStateNeeded={false}
                onCountryChange={handleCountryChange}
                onStateChange={() => { }}
              />
            </div>
            
            {type === "business" && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isTaxRegistered"
                    name="isTaxRegistered"
                    checked={isTaxRegistered}
                    onCheckedChange={setIsTaxRegistered}
                    defaultChecked={false}
                  />
                  <Label htmlFor="isTaxRegistered">Tax Registered</Label>
                </div>
                {isTaxRegistered && (
                  <div className="ml-6 pt-2">
                    <Label htmlFor="taxNumber">
                      Tax Registration Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="taxNumber"
                      name="taxNumber"
                      placeholder="Tax ID"
                      required={isTaxRegistered}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contacts Section */}
          <div className="py-2">
            {/* <h3 className="text-md font-medium mb-2">Contact Information <span className="text-red-500">*</span></h3> */}
            <ContactsSection
              fields={fields}
              append={append}
              remove={remove}
              setValue={form.setValue}
              watch={form.watch}
              formState={form.formState}
              control={form.control}
            />
          </div>

          {/* Additional Sections in Accordions */}
          <div className="pt-2">
            <Accordion type="single" collapsible>
              <AccordionItem value="address">
                <AccordionTrigger>Add Address</AccordionTrigger>
                <AccordionContent>
                  <AddressSection />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible className="mt-2">
              <AccordionItem value="notes">
                <AccordionTrigger>Add Notes</AccordionTrigger>
                <AccordionContent>
                  <Textarea 
                    id="notes" 
                    name="notes"
                    placeholder="Additional information about this customer"
                    rows={4}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      

      {/* Show error message if exists */}
      {state?.error && (
        <div className="text-red-500 text-sm px-4">{state.error}</div>
      )}

      {/* Fixed Footer */}
      <div className="border-t p-4 mt-auto">
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              `Create ${type === "business" ? "Business" : "Individual"}`
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}