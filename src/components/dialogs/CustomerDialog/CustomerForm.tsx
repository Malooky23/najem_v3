
'use client'
import { useState, useCallback, memo, useEffect, useRef } from "react" // Add useEffect
import { useFieldArray, useForm } from "react-hook-form"
import { ContactsSection } from "@/components/contacts-section" // Remove ContactFormData import
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { createBusinessCustomer, createIndividualCustomer, updateBusinessCustomer, updateIndividualCustomer } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from '@tanstack/react-query'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion" // Remove AccordionValue
import { useActionState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { contactsArraySchema, contactSchema } from "@/lib/validations/contact"
import { z } from 'zod'
import LocationSelector, { CountryProps } from "@/components/ui/location-input"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import AddressSection from "./AddressSection"
import { EnrichedCustomer } from "@/types/customer" // Import EnrichedCustomer
import { AddressDetails } from "@/server/db/schema"
import { CreateAddressSchema, ContactDetailsSchema, AddressDetailsSchema } from "@/types/common"

// Define a type for the form data, closely related to EnrichedCustomer but form-friendly

const addressSchema = z.object({
  address1: z.string().optional().nullable(),
  address2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(), // Keep simple for now
}).optional().nullable(); // Make the whole address object optional


// Base schema for common fields
const baseCustomerSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100, "Display name must be at most 100 characters"),
  country: z.string().min(1, "Country is required"), // Will be validated separately via state
  contacts: z.array(ContactDetailsSchema),
  notes: z.string().nullable().optional(),
  address: AddressDetailsSchema, // Let AddressSection handle its validation internally for now
  customerId: z.string().optional(), // For updates
});

// Schema for Business Customer Form Data
const businessCustomerSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  taxNumber: z.string().optional().nullable(),
}).merge(baseCustomerSchema);

// Schema for Individual Customer Form Data
const individualCustomerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  personalId: z.string().optional(),
}).merge(baseCustomerSchema);

// Combined type for form data
type CustomerFormData = z.infer<typeof businessCustomerSchema> | z.infer<typeof individualCustomerSchema>;

async function submitCustomerForm(prevState: any, formData: FormData, options: {
  type: "INDIVIDUAL" | "BUSINESS",
  form: any,
  isTaxRegistered: boolean,
  queryClient: any,
  toast: any,
  onClose: () => void,
  initialData?: EnrichedCustomer | null // Add initialData here
  selectedCountry: any
  isDirty: boolean
}) {
  const { type, form, isTaxRegistered, queryClient, toast, onClose, initialData, selectedCountry, isDirty } = options; // Destructure isDirty
  const isEditing = !!initialData?.customerId; // More reliable check for editing
  // try { // We might not need try-catch if useActionState handles errors
  const formObject: Record<string, any> = {};
  // const addressFields: Record<string, string> = {};

  // ORIGINAL Handle regular form data
  // formData.forEach((value, key) => {
  //   if (!key.startsWith('contacts') && key !== 'isTaxRegistered') {
  //     if (key.startsWith('address.')) {
  //       const addressField = key.split('.')[ 1 ];
  //       addressFields[ addressField ] = value as string;
  //     } else {
  //       formObject[ key ] = value;
  //     }
  //   }
  // });

  // Check if all address fields are empty
  // const hasAddressData = Object.values(addressFields).some(value => value.trim() !== '');
  // formObject.address = hasAddressData ? addressFields : null;

  formData.forEach((value, key) => {
    // if (!key.startsWith('contacts') && key !== 'isTaxRegistered') {
    // if (key.startsWith('address.')) {
    //   const addressField = key.split('.')[ 1 ];
    //   addressFields[ addressField ] = value as string;
    // } else {
    //   formObject[ key ] = value;
    // }
    // Exclude contacts and address fields managed by RHF state
    if (!key.startsWith('contacts') && !key.startsWith('address.') && key !== 'isTaxRegistered') {
      formObject[ key ] = value;
    }
  });



  // Handle taxNumber based on state for business type
  if (type === 'BUSINESS') {
    formObject.isTaxRegistered = isTaxRegistered;
    if (!isTaxRegistered) {
      formObject.taxNumber = null;
    } else if (!formData.get('taxNumber')) { // Ensure taxNumber is required if switch is on
      return { error: "Tax Registration Number is required when 'Tax Registered' is enabled." };
    }
  }

  // Get address data from RHF state
  const addressData = form.getValues('address');
  // Check if addressData has any actual values before submitting
  const hasAddressData = addressData && Object.values(addressData).some(value => value && String(value).trim() !== '');
  formObject.address = hasAddressData ? addressData : null;
  console.log("addressData:", addressData)


  // Add contacts from react-hook-form state
  const contacts = form.getValues('contacts');
  formObject.contacts = contacts.map((contact: { contactData: any; contactType: any; isPrimary: any }) => ({ // Adjusted mapping
    contact_data: contact.contactData, // Use contactData
    contact_type: contact.contactType, // Use contactType
    is_primary: contact.isPrimary
  }));

  // Use selectedCountry state for country validation
  const countryValue = selectedCountry?.name || '';
  formObject.country = countryValue; // Add country from state
  if (countryValue === '') {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Please select a country.",
    });
    return { error: "Select Country" };
  }

  // Add customerId if editing
  if (isEditing && initialData?.customerId) {
    formObject.customerId = initialData.customerId;
  }

  let result;
  if (isEditing) {
    if (!isDirty) {
      console.log("No changes detected. Skipping update.");
      onClose(); // Close the dialog as if successful, but without API call/toast
      return { success: true, message: "No changes detected." }; // Return a success-like state to prevent error display
    }
    console.log("UPDATE ACTION NEEDED", formObject);
    // result = type === 'business' ? await updateBusinessCustomer(formObject) : await updateIndividualCustomer(formObject);
    result = type === 'BUSINESS' ? await updateBusinessCustomer(formObject) : await updateIndividualCustomer(formObject);
  } else {
    result = type === 'BUSINESS' ? await createBusinessCustomer(formObject) : await createIndividualCustomer(formObject);
  }

  if (result?.success === true) {
    queryClient.invalidateQueries({ queryKey: [ 'customers' ] })
    if (isEditing) queryClient.invalidateQueries({ queryKey: [ 'customer', formObject.customerId ] })
    onClose();
    toast({
      variant: "success",
      title: isEditing ? "Customer Updated!" : "New Customer Created!",
      description: "",
    });
    return { success: true, message: `Customer ${isEditing ? 'updated' : 'created'} successfully` };
  } else if (!isEditing) { // Only return error if creating failed, update logic might differ

    return { error: result?.error || "Failed to create customer" };
  } else if (isEditing) {
    // Handle potential update errors (assuming update actions return similar structure)
    return { error: result?.error || "Failed to update customer" };
  }
  return { error: "An unexpected state occurred." }; // Fallback
  // } catch (error) { // Let useActionState handle promise rejections
  //   return { error: error instanceof Error ? error.message : "An unexpected error occurred." };
}


// Memoize the LocationSelector component
const MemoizedLocationSelector = memo(LocationSelector);

export default function CustomerForm({
  type,
  onClose,
  initialData = null
}: {
  type: "INDIVIDUAL" | "BUSINESS";
  onClose: () => void;
  initialData?: EnrichedCustomer | null;
}) {
  // Determine initial tax registration state based on initialData (only for business)
  const initialIsTaxRegistered = type === 'BUSINESS' && !!initialData?.business?.taxNumber;
  const [ isTaxRegistered, setIsTaxRegistered ] = useState(initialIsTaxRegistered);
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Initialize country state from initialData if available
  const [ selectedCountry, setSelectedCountry ] = useState<any>(
    initialData?.country ? { name: initialData.country } : null // Adjust based on LocationSelector's expected format
  )
  const scrollContainerRef = useRef<HTMLDivElement>(null); // Ref for the scrollable container

  const [ state, formAction, isPending ] = useActionState(
    (prevState: any, formData: FormData) =>
      submitCustomerForm(prevState, formData, {
        type,
        form,
        isTaxRegistered,
        queryClient,
        toast,
        onClose,
        initialData, // Pass initialData to the action
        selectedCountry, // Pass selectedCountry state
        isDirty: form.formState.isDirty  // Pass the isDirty state

      }),
    null
  );

  // Map EnrichedCustomer contacts to FormContact structure
  // This mapping needs to match the ContactDetailsSchema used in the form
  const defaultContacts = initialData?.contacts?.length
    ? initialData.contacts.map(c => {
      const detail = c.contactDetail || {}; // Access nested detail if needed
      return {
        contactData: detail.contactData || "", // Use contactData
        contactType: (detail.contactType as "email" | "phone" | "mobile" | "other" | "landline") || "email", // Use contactType
        isPrimary: detail.isPrimary || false,
        // Include other fields from ContactDetailsSchema with defaults if needed
        contactDetailsId: detail.contactDetailsId || crypto.randomUUID(), // Provide a default or existing ID
        createdAt: detail.createdAt ? new Date(detail.createdAt) : new Date(),
        updatedAt: detail.updatedAt ? new Date(detail.updatedAt) : null,
      };
    })
    : [ {
      contactData: "",
      contactType: "email" as const,
      isPrimary: true,
      contactDetailsId: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: null,
    } ];


  // Ensure at least one primary contact if mapping initial data
  if (initialData?.contacts?.length && !defaultContacts.some(c => c.isPrimary)) {
    if (defaultContacts[ 0 ]) {
      defaultContacts[ 0 ].isPrimary = true;
    }
  }
  let initialAddress: AddressDetails = {
    addressId: "",
    address1: null,
    address2: null,
    city: null,
    country: null,
    postalCode: null,
    addressType: null,
    createdAt: new Date(), // Initialize with a valid Date
    updatedAt: null
  }

  let initialCountry
  if (initialData) {
    if (initialData.country) {
      initialCountry = initialData.country
    }

    if (initialData.addresses?.length! > 0) {
      if (initialData.addresses)
        if (initialData.addresses[ 0 ].address) {
          initialAddress = initialData?.addresses[ 0 ].address
        }
    }
  }


  const form = useForm<CustomerFormData>({ // Use the new CustomerFormData type
    defaultValues: {
      // Map initialData fields to form fields
      customerId: initialData?.customerId, // Include customerId for updates
      businessName: initialData?.business?.businessName || "",
      firstName: initialData?.individual?.firstName || "",
      lastName: initialData?.individual?.lastName || "",
      middleName: initialData?.individual?.middleName || "",
      displayName: initialData?.displayName || "",
      personalId: initialData?.individual?.personalID || "",
      notes: initialData?.notes || "",
      contacts: defaultContacts,
      taxNumber: initialData?.business?.taxNumber || "",
      country: initialData?.country || "", // Country is handled by state `selectedCountry`
      address: initialAddress || null, // Address is handled by AddressSection
    },
    mode: "onBlur", // Changed mode for potentially better UX
    resolver: zodResolver(
      type === "BUSINESS" ? businessCustomerSchema : individualCustomerSchema
    )
  });

  const { fields, append, remove } = useFieldArray({ // Removed <CustomerFormData> generic here, RHF infers it
    control: form.control,
    name: "contacts",

  });

  


  // Memoize the callback to prevent recreation on every render
  const handleCountryChange = useCallback((country: any) => {
    const countryName = country?.name || ''; // Get the string value
    setSelectedCountry(country)
    form.setValue('country', countryName, { // *** Update RHF's state ***
      shouldValidate: true, // Optional: trigger validation
      shouldDirty: true,    // *** Mark the field as dirty ***
      shouldTouch: true     // Optional: mark field as touched
    });

  }, [form])

  const [ focusCountry, setFocusCountry ] = useState(false)
  const [ focusContacts, setFocusContacts ] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    const formErrors = form.formState.errors;

    // Prevent default form submission if client-side validation fails before RHF kicks in
    // RHF's zodResolver should handle most of this, but keep checks for state-managed fields.

    // 1. Check Country (managed by state)
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

    // 2. Check Contacts (basic check, RHF/Zod handles detailed validation)
    const contactsValue = form.getValues('contacts');
    const addressValue = form.getValues('address');
    // Use contactData and ensure contact exists before trimming
    if (!contactsValue || contactsValue.length === 0 || !contactsValue.some(c => c && c.contactData?.trim())) {
      e.preventDefault();
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please add at least one contact.",
      });
      setFocusContacts(true)
      setTimeout(() => setFocusContacts(false), 6000)
      return;
    }

    // RHF/Zod handles the rest of the validation via the resolver

    if (Object.keys(formErrors).length > 0) {
      e.preventDefault();
      const errorMessages = Object.entries(formErrors)
        .map(([ field, error ]) => `${field}: ${error.message}`)
        .join('\n');

      toast({
        variant: "destructive",
        title: "Validation Errors",
        description: "Please fix the following errors:\n" + errorMessages,
      });
      return;
    }
  };
  // Handler for Accordion changes
  const handleAccordionChange = (value: string[]) => {
    // Check if 'address' is now open
    if (value.includes('address')) {
      // Use setTimeout to ensure DOM has updated height after opening
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 200); // Small delay might be needed
    }
  };
  return (
    <form
      action={formAction}
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <div ref={scrollContainerRef} className="max-h-[65vh] flex-1 overflow-y-auto px-2 sm:px-4 custom-scrollbar">
        {/* <div className="max-h-[65vh] flex-1 overflow-y-auto px-2 sm:px-4 custom-scrollbar"> */}
        <div className="space-y-4 pb-4 relative">

          {/* <pre>Dirty Fields: {JSON.stringify(form.formState.dirtyFields)}</pre> */}
          <pre hidden>isDirty: {JSON.stringify(form.formState.isDirty)}</pre>
          <div className="mb-4"></div>
          <Label htmlFor="displayName">
            Display Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="displayName"
            // name="displayName"
            placeholder="How the customer will appear in lists"
            required
            {...form.register("displayName")} // Register field
          />
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          {/* Add hidden input for customerId if editing */}
          {initialData?.customerId && (
            <input type="hidden" name="customerId" value={initialData.customerId} />
          )}
          {type === "BUSINESS" ? (
            <div>
              <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
              <Input id="businessName" placeholder="Company name" required {...form.register("businessName")} />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                <Input id="firstName" placeholder="First name" required {...form.register("firstName")} />
              </div>
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input id="middleName" placeholder="Middle name" {...form.register("middleName")} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                <Input id="lastName" placeholder="Last name" required {...form.register("lastName")} />
              </div>
              <div>
                <Label htmlFor="personalId">Personal ID</Label>
                <Input id="personalId" placeholder="ID number" {...form.register("personalId")} />
              </div>
            </div>
          )}

          <div className={cn("space-y-1", focusCountry ? "animate-flash-red border-2 border-red-500 p-2 rounded-md" : "")}>
            <Label>Location <span className="text-red-500">*</span></Label>
            <MemoizedLocationSelector
              isStateNeeded={false}
              onCountryChange={handleCountryChange}
              initialCountry={initialCountry} // Pass initial country name
            // onStateChange={() => { }}
            />
          </div>

          {type === "BUSINESS" && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isTaxRegistered"
                  // name="isTaxRegistered" // Not needed, state handles this
                  checked={isTaxRegistered}
                  onCheckedChange={setIsTaxRegistered}
                // defaultChecked={initialIsTaxRegistered} // `checked` prop controls it
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
                    // name="taxNumber" // Use register
                    placeholder="Tax ID"
                    required={isTaxRegistered}
                    {...form.register("taxNumber")} // Register field
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contacts Section */}
        <div className={cn("py-2", focusContacts ? "animate-flash-red border-2 border-red-500 rounded-md" : "")}>

          {/* <div className="py-2"> */}
          {/* <h3 className="text-md font-medium mb-2">Contact Information <span className="text-red-500">*</span></h3> */}
          <ContactsSection // Remove the generic type argument
            fields={fields as any} // Use 'as any' for now to bypass complex type mismatch
            append={append as any} // Use 'as any'
            remove={remove}
            setValue={form.setValue as any} // Use 'as any'
            watch={form.watch as any} // Use 'as any'
            formState={form.formState as any} // Use 'as any'
            control={form.control as any} // Use 'as any'
          />
        </div>

        {/* Additional Sections in Accordions */}
        <div className="pt-2">
          <Accordion type="multiple" onValueChange={handleAccordionChange}  >
            <AccordionItem value="address">
              <AccordionTrigger >{form.getValues("address.country") ? "Edit Address" : "Add Address"}</AccordionTrigger>
              {/* <AccordionContent forceMount={isForceMount || undefined}> */}
              <AccordionContent >
                <AddressSection control={form.control} initialData={initialAddress} register={form.register} /> {/* Pass initial address - Adjust based on actual structure */}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="notes">
              <AccordionTrigger>{initialData?.notes ? "Edit Notes" : "Add Notes"}</AccordionTrigger>
              <AccordionContent>
                <Textarea
                  id="notes"
                  // name="notes" // Use register
                  placeholder="Additional information about this customer"
                  rows={4}
                  {...form.register("notes")} // Register field
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* <Accordion type="single" collapsible className="mt-2">
            <AccordionItem value="notes">
              <AccordionTrigger>{initialData?.notes ? "Edit Notes": "Add Notes"}</AccordionTrigger>
              <AccordionContent>
                <Textarea
                  id="notes"
                  // name="notes" // Use register
                  placeholder="Additional information about this customer"
                  rows={4}
                  {...form.register("notes")} // Register field
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion> */}
        </div>
      </div>


      {/* Show error message if exists */}
      {state?.error && (
        <div className="text-red-600 text-sm px-4 font-medium bg-red-50 p-2 rounded border border-red-200">{state.error}</div>
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
                {isPending ? (initialData ? 'Updating...' : 'Creating...') : ''}
              </>
            ) : (
              `${initialData ? 'Update' : 'Create'} ${type === "BUSINESS" ? "Business" : "Individual"}`
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}