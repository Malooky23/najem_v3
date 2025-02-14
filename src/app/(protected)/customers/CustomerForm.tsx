import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { ContactsSection, type ContactFormData } from "@/components/contacts-section"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBusinessCustomer, createIndividualCustomer } from "@/server/db/actions"
// import { CONTACT_TYPE_OPTIONS } from "@/lib/constants/contact_details";
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



async function submitCustomerForm(prevState: any, formData: FormData, options: {
  type: "individual" | "business",
  form: any,
  isTaxRegistered: boolean,
  queryClient: any,
  toast: any,
  onClose: () => void
}) {
  const { type, form, isTaxRegistered, queryClient, toast, onClose } = options;



  console.log('=== Form Submission Started ===');
  console.log('Form Type:', type);
  console.log('Form Valid State:', form.formState.isValid);
  console.log('Form Errors:', form.formState.errors);
  console.log('Tax Registered:', isTaxRegistered);

  if (!form.formState.isValid) {
    console.log('Form Validation Failed:', {
      errors: form.formState.errors,
      dirtyFields: form.formState.dirtyFields,
      touchedFields: form.formState.touchedFields
    });
    toast({
      variant: "destructive",
      title: "Error",
      description: "Please fix the form errors before submitting.",
    });
    return { error: "Form validation failed" };
  }

  try {
    const formObject: Record<string, any> = {};
    const addressFields: Record<string, string> = {};

    console.log('=== Raw Form Data ===');
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

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

    console.log('=== Processed Address Fields ===', addressFields);

    // Check if all address fields are empty
    const hasAddressData = Object.values(addressFields).some(value => value.trim() !== '');
    formObject.address = hasAddressData ? addressFields : {};

    console.log('Address Data Present:', hasAddressData);

    // Handle taxNumber for business type
    if (type === 'business') {
      formObject.isTaxRegistered = isTaxRegistered;
      if (!isTaxRegistered) {
        formObject.taxNumber = null;
      }
      console.log('Business Tax Info:', {
        isTaxRegistered,
        taxNumber: formObject.taxNumber
      });
    }

    // Add contacts from react-hook-form state
    const contacts = form.getValues('contacts');
    console.log('=== Contact Data ===', contacts);

    formObject.contacts = contacts.map((contact: { data: any; type: any; isPrimary: any }) => ({
      contact_data: contact.data,
      contact_type: contact.type,
      is_primary: contact.isPrimary
    }));

    console.log('=== Final Form Object ===', formObject);

    let result;
    if (type === 'business') {
      console.log('Submitting Business Customer...');
      result = await createBusinessCustomer(formObject);
    } else {
      console.log('Submitting Individual Customer...');
      result = await createIndividualCustomer(formObject);
    }

    console.log('Submission Result:', result);

    if (result?.success === true) {
      console.log('Customer created successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      onClose();
      return { success: true, message: "Customer created successfully" };
    }

    console.log('Submission failed:', result);
    return { error: "Failed to create customer" };
  } catch (error) {
    console.error('=== Submission Error ===', error);
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred."
    };
  }
}

export default function CustomerForm({ type, onClose }: { type: "individual" | "business"; onClose: () => void }) {
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
      ]
    },
    mode: "onChange",
    resolver: zodResolver(z.object({
      contacts: contactsArraySchema
    }))
  });

  // Add form state logging
  console.log('=== Form State ===', {
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    dirtyFields: form.formState.dirtyFields
  });

  // Log whenever form values change
  form.watch((data) => {
    console.log('=== Form Values Updated ===', data);
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

  const canSubmit = form.formState.isValid && form.watch('contacts').some(contact =>
    contact.data && contact.data.trim() !== '' &&
    contactSchema.safeParse({
      data: contact.data,
      type: contact.type,
      isPrimary: contact.isPrimary
    }).success
  );

  const [selectedCountry, setSelectedCountry] = useState<any>(null)

  const handleCountryChange = (country: any) => {
    setSelectedCountry(country)
    // Clear any existing error states if needed
    // Note: the hidden input will automatically get included in the form submission
  }

  return (
    <form
      action={formAction}
      className="space-y-6"
      onSubmit={(e) => {
        if (!canSubmit) {
          e.preventDefault();
          toast({
            variant: "destructive",
            title: "Error",
            description: "At least one valid contact is required.",
          });
        }
      }}
    >
      <div className="max-h-[80vh] flex-1 overflow-y-auto px-6">
        <div className="space-y-6 pb-6 relative"> {/* Add relative positioning */}
          {/* Add hidden input for country */}
          <input 
            type="hidden" 
            name="country" 
            value={selectedCountry?.name || ''} 
          />
          
          {/* Basic Information */}
          <div className="space-y-4">
            {type === "business" ? (
              <div>
                <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
                <Input id="businessName" name="businessName" placeholder="Acme Corp" required />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input id="firstName" name="firstName" placeholder="John" required />
                </div>
                <div>
                  <Label htmlFor="middleName">Middle Name </Label>
                  <Input id="middleName" name="middleName" placeholder="Doe" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input id="lastName" name="lastName" placeholder="Smith" required />
                </div>
                <div>
                  <Label htmlFor="personalId">Personal ID</Label>
                  <Input id="personalId" name="personalId" placeholder="1234567890" />
                </div>
              </>
            )}
            <div className="space-y-2 z-10"> {/* Add z-index */}
              <Label>Location <span className="text-red-500">*</span></Label>
              <LocationSelector
              isStateNeeded={false}
                onCountryChange={handleCountryChange}
                onStateChange={() => {}} // We can ignore state changes
              />

            </div>
            {type === "business" && (
              <>
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
                {isTaxRegistered &&
                  <div>
                    <Label htmlFor="taxNumber">
                      Tax Registration Number {isTaxRegistered && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="taxNumber"
                      name="taxNumber"
                      placeholder="Tax ID"
                      required={isTaxRegistered}
                    />
                  </div>}
              </>
            )}

          </div>

          {/* Address Section */}

          {/* New Contacts Section */}
          <ContactsSection
            fields={fields}
            append={append}
            remove={remove}
            setValue={form.setValue}
            watch={form.watch}
            formState={form.formState}
            control={form.control}
          />

          <Accordion type="single" collapsible>
            <AccordionItem value="address">
              <AccordionTrigger>Add Address</AccordionTrigger>
              <AccordionContent>
                <AddressSection />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* <div className="flex items-center space-x-2">
            <Switch
              id="addAddress"
              name="addAddress"
              checked={showAddress}
              onCheckedChange={setShowAddress}
            />
            <Label htmlFor="addAddress">Add Address</Label>
          </div>
          {showAddress && <AddressSection />} */}
        </div>
        {/* </Card> */}
      </div>

      {/* Show error message if exists */}
      {state?.error && (
        <div className="text-red-500 text-sm">{state.error}</div>
      )}

      {/* Fixed Footer */}
      <div className="border-t p-6 mt-auto">
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
            disabled={isPending || !canSubmit}
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

function AddressSection() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Address Information</CardTitle>
      </CardHeader>
      <CardContent>

        <div>
          <Label htmlFor="address.address1">Address 1</Label>
          <Input id="address.address1" name="address.address1" required />
        </div>
        <div>
          <Label htmlFor="address.address2">Address 2</Label>
          <Input id="address.address2" name="address.address2" />
        </div>
        <div>
          <Label htmlFor="address.city">City</Label>
          <Input id="address.city" name="address.city" required />
        </div>
        <div>
          <Label htmlFor="address.postalCode">Postal Code</Label>
          <Input id="address.postalCode" name="address.postalCode" required />
        </div>
        <div>
          <Label htmlFor="address.country">Country</Label>
          <Select name="address.country">
            <SelectTrigger>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>

    </Card>
  )
}

