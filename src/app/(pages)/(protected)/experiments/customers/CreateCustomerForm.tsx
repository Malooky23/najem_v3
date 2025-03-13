"use client"

import type React from "react"

import { useState } from "react"
import { z } from "zod"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  PlusCircle,
  Trash2,
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Globe,
  UserCircle,
  AtSign,
  Star,
  Briefcase,
  Contact,
  BadgeInfo,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import testAction from "../action"

// Schema definitions
const CreateContactSchema = z.object({
  contact_type: z.enum(["email", "phone", "mobile", "landline", "other"]),
  contact_data: z.string(),
  is_primary: z.boolean(),
})

const CreateAddressSchema = z.object({
  address1: z.string().optional().nullish(),
  address2: z.string().optional().nullish(),
  city: z.string().optional().nullish(),
  country: z.string().optional().nullish(),
  postalCode: z.string().optional().nullish(),
})

const IndividualDataSchema = z.object({
  country: z.string().min(2, "Country is required"),
  notes: z.string().nullable().default(null),
  displayName: z.string().max(100, "Display name must be at most 100 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  personalId: z.string().optional().nullish(),
  address: CreateAddressSchema.optional().nullish(),
  contacts: z.array(CreateContactSchema).min(1, "At least one contact required"),
})

const BusinessDataSchema = z.object({
  country: z.string().min(2, "Country is required"),
  notes: z.string().nullable().default(null),
  displayName: z.string().max(100, "Display name must be at most 100 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  isTaxRegistered: z.boolean().default(false),
  taxNumber: z.string().nullish(),
  address: CreateAddressSchema.optional().nullish(),
  contacts: z.array(CreateContactSchema).min(1, "At least one contact required"),
})

type CustomerType = "individual" | "business"
type FormStep = "personal" | "address" | "contact" | "additional" | "review"

// Helper function to get contact type icon
const getContactTypeIcon = (type: string) => {
  switch (type) {
    case "email":
      return <Mail className="h-4 w-4" />
    case "phone":
    case "mobile":
      return <Phone className="h-4 w-4" />
    case "landline":
      return <Phone className="h-4 w-4" />
    default:
      return <Contact className="h-4 w-4" />
  }
}

export function CreateCustomerDialog() {
  const [open, setOpen] = useState(false)
  const [customerType, setCustomerType] = useState<CustomerType | null>(null)
  const [activeTab, setActiveTab] = useState<CustomerType | null>(null)
  const [currentStep, setCurrentStep] = useState<FormStep>("personal")

  // Individual form
  const individualForm = useForm<z.infer<typeof IndividualDataSchema>>({
    resolver: zodResolver(IndividualDataSchema),
    defaultValues: {
      country: "",
      notes: null,
      displayName: "",
      firstName: "",
      lastName: "",
      personalId: "",
      address: {
        address1: "",
        address2: "",
        city: "",
        country: "",
        postalCode: "",
      },
      contacts: [
        {
          contact_type: "email",
          contact_data: "",
          is_primary: true,
        },
      ],
    },
    mode: "onChange",
  })

  const individualContactsArray = useFieldArray({
    control: individualForm.control,
    name: "contacts",
  })

  // Business form
  const businessForm = useForm<z.infer<typeof BusinessDataSchema>>({
    resolver: zodResolver(BusinessDataSchema),
    defaultValues: {
      country: "",
      notes: null,
      displayName: "",
      businessName: "",
      isTaxRegistered: false,
      taxNumber: "",
      address: {
        address1: "",
        address2: "",
        city: "",
        country: "",
        postalCode: "",
      },
      contacts: [
        {
          contact_type: "email",
          contact_data: "",
          is_primary: true,
        },
      ],
    },
    mode: "onChange",
  })

  const businessContactsArray = useFieldArray({
    control: businessForm.control,
    name: "contacts",
  })

  const handleCustomerTypeSelect = (type: CustomerType) => {
    setCustomerType(type)
    setActiveTab(type)
    setCurrentStep("personal")
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as CustomerType)
    setCurrentStep("personal")
  }

  const onSubmitIndividual = (data: z.infer<typeof IndividualDataSchema>) => {
    if (currentStep !== "review") {
      // Don't submit if not on review step
      return
    }
    console.log("Individual customer data:", data)
    testAction(data)
    setOpen(false)
    setCustomerType(null)
    setCurrentStep("personal")
    // individualForm.reset()
  }

  const onSubmitBusiness = (data: z.infer<typeof BusinessDataSchema>) => {
    if (currentStep !== "review") {
      // Don't submit if not on review step
      return;
    }
    console.log("Business customer data:", data)
    testAction(data)
    setOpen(false)
    setCustomerType(null)
    setCurrentStep("personal")
    // businessForm.reset()
  }

  const handleClose = () => {
    setOpen(false)
    setCustomerType(null)
    setCurrentStep("personal")
    // individualForm.reset()
    // businessForm.reset()
  }

  const nextStep = async () => {
    const currentForm = activeTab === "individual" ? individualForm : businessForm

    // Validate current step fields before proceeding
    let isValid = false

    // if (currentStep === "personal") {
    //   if (activeTab === "individual") {
    //     isValid = await currentForm.trigger(["firstName", "lastName", "displayName", "country", "personalId"])
    //   } else {
    //     isValid = await currentForm.trigger(["businessName", "displayName", "country", "isTaxRegistered", "taxNumber"])
    //   }
    //   if (isValid) setCurrentStep("address")
    // } else if (currentStep === "address") {
    //   // Address is optional, so we can proceed without validation
    //   setCurrentStep("contact")
    // } else if (currentStep === "contact") {
    //   isValid = await currentForm.trigger("contacts")
    //   if (isValid) setCurrentStep("additional")
    // } else if (currentStep === "additional") {
    //   // Notes are optional, so we can proceed without validation
    //   setCurrentStep("review")
    // }
    if (currentStep === "personal") {
      if (activeTab === "individual") {
        isValid = await currentForm.trigger(["firstName", "lastName", "displayName", "country", "personalId"])
      } else {
        isValid = await currentForm.trigger(["businessName", "displayName", "country", "isTaxRegistered", "taxNumber"])
      }
      if (isValid) { // Added braces
        setCurrentStep("address")
      }
    } else if (currentStep === "address") {
      // Address is optional, so we can proceed without validation
      setCurrentStep("contact")
    } else if (currentStep === "contact") {
      isValid = await currentForm.trigger("contacts")
      if (isValid) { // Added braces
        setCurrentStep("additional")
      }
    } else if (currentStep === "additional") {
      // Notes are optional, so we can proceed without validation
      setCurrentStep("review")
    }
  }

  const prevStep = () => {
    if (currentStep === "address") setCurrentStep("personal")
    else if (currentStep === "contact") setCurrentStep("address")
    else if (currentStep === "additional") setCurrentStep("contact")
    else if (currentStep === "review") setCurrentStep("additional")
  }

  // Step indicator component
  const StepIndicator = ({ steps }: { steps: { id: FormStep; label: string; icon: React.ReactNode }[] }) => {
    return (
      <div className="flex justify-between items-center mb-8 w-full">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center relative">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10",
                currentStep === step.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : getStepStatus(step.id) === "completed"
                    ? "bg-primary/10 text-primary border-primary"
                    : "bg-muted text-muted-foreground border-muted",
              )}
            >
              {getStepStatus(step.id) === "completed" ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
            </div>
            <span
              className={cn(
                "text-xs mt-2 font-medium",
                currentStep === step.id
                  ? "text-primary"
                  : getStepStatus(step.id) === "completed"
                    ? "text-primary"
                    : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute h-[2px] top-5 w-[calc(100%-2rem)] left-[calc(50%+1rem)]",
                  getStepStatus(steps[index + 1].id) === "completed" ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  // Helper to determine step status
  const getStepStatus = (step: FormStep) => {
    const stepOrder: FormStep[] = ["personal", "address", "contact", "additional", "review"]
    const currentIndex = stepOrder.indexOf(currentStep)
    const stepIndex = stepOrder.indexOf(step)

    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "current"
    return "upcoming"
  }

  // Define steps for both customer types
  const individualSteps = [
    { id: "personal" as FormStep, label: "Personal", icon: <User className="h-5 w-5" /> },
    { id: "address" as FormStep, label: "Address", icon: <MapPin className="h-5 w-5" /> },
    { id: "contact" as FormStep, label: "Contact", icon: <Phone className="h-5 w-5" /> },
    { id: "additional" as FormStep, label: "Additional", icon: <FileText className="h-5 w-5" /> },
    { id: "review" as FormStep, label: "Review", icon: <ClipboardCheck className="h-5 w-5" /> },
  ]

  const businessSteps = [
    { id: "personal" as FormStep, label: "Business", icon: <Building2 className="h-5 w-5" /> },
    { id: "address" as FormStep, label: "Address", icon: <MapPin className="h-5 w-5" /> },
    { id: "contact" as FormStep, label: "Contact", icon: <Phone className="h-5 w-5" /> },
    { id: "additional" as FormStep, label: "Additional", icon: <FileText className="h-5 w-5" /> },
    { id: "review" as FormStep, label: "Review", icon: <ClipboardCheck className="h-5 w-5" /> },
  ]

  // Render individual form step content
  const renderIndividualStepContent = () => {
    switch (currentStep) {
      case "personal":
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                <UserCircle className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={individualForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        First Name
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={individualForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Last Name
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={individualForm.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Display Name
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <BadgeInfo className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>Name that will be displayed in the system</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={individualForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Country
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={individualForm.control}
                  name="personalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal ID</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )
      case "address":
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={individualForm.control}
                  name="address.address1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={individualForm.control}
                  name="address.address2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={individualForm.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={individualForm.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={individualForm.control}
                  name="address.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )
      case "contact":
        return (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                  <Phone className="h-5 w-5" />
                  Contact Details
                  <span className="text-destructive">*</span>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() =>
                    individualContactsArray.append({
                      contact_type: "email",
                      contact_data: "",
                      is_primary: individualContactsArray.fields.length === 0,
                    })
                  }
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {individualContactsArray.fields.map((field, index) => {
                const isPrimary = individualForm.watch(`contacts.${index}.is_primary`)
                const contactType = individualForm.watch(`contacts.${index}.contact_type`)

                return (
                  <Card
                    key={field.id}
                    className={cn("overflow-hidden border", isPrimary ? "border-primary bg-primary/5" : "")}
                  >
                    <CardContent className="p-4">
                      <div className="grid grid-cols-[1fr_auto] gap-4">
                        <div className="grid grid-cols-[1fr_2fr] gap-4">
                          <FormField
                            control={individualForm.control}
                            name={`contacts.${index}.contact_type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="pl-3">
                                      <div className="flex items-center gap-2">
                                        {getContactTypeIcon(contactType)}
                                        <SelectValue placeholder="Select type" />
                                      </div>
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="email">
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="phone">
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Phone
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="mobile">
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Mobile
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="landline">
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Landline
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="other">
                                      <div className="flex items-center gap-2">
                                        <Contact className="h-4 w-4" />
                                        Other
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={individualForm.control}
                            name={`contacts.${index}.contact_data`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Contact</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    {contactType === "email" && (
                                      <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    )}
                                    {(contactType === "phone" ||
                                      contactType === "mobile" ||
                                      contactType === "landline") && (
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                      )}
                                    {contactType === "other" && (
                                      <Contact className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    )}
                                    <Input className="pl-9" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex items-end space-x-2">
                          <FormField
                            control={individualForm.control}
                            name={`contacts.${index}.is_primary`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-end space-x-2">
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked)
                                        // If this is being set as primary, set others to not primary
                                        if (checked) {
                                          individualContactsArray.fields.forEach((_, i) => {
                                            if (i !== index) {
                                              individualForm.setValue(`contacts.${i}.is_primary`, false)
                                            }
                                          })
                                        }
                                      }}
                                      className={cn(isPrimary ? "border-primary text-primary" : "")}
                                    />
                                    <FormLabel
                                      className={cn(
                                        "text-sm font-normal flex items-center gap-1",
                                        isPrimary ? "text-primary font-medium" : "",
                                      )}
                                    >
                                      {isPrimary && <Star className="h-3 w-3 fill-primary text-primary" />}
                                      Primary
                                    </FormLabel>
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          {individualContactsArray.fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => individualContactsArray.remove(index)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </CardContent>
          </Card>
        )
      case "additional":
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={individualForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Additional information about this customer"
                        className="min-h-[100px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )
      case "review":
        const individualData = individualForm.getValues()
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                  <UserCircle className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">First Name</h4>
                    <p className="text-sm">{individualData.firstName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Last Name</h4>
                    <p className="text-sm">{individualData.lastName}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Display Name</h4>
                  <p className="text-sm">{individualData.displayName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Country</h4>
                    <p className="text-sm">{individualData.country}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Personal ID</h4>
                    <p className="text-sm">{individualData.personalId || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Address Line 1</h4>
                    <p className="text-sm">{individualData.address?.address1 || "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Address Line 2</h4>
                    <p className="text-sm">{individualData.address?.address2 || "—"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">City</h4>
                    <p className="text-sm">{individualData.address?.city || "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Country</h4>
                    <p className="text-sm">{individualData.address?.country || "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Postal Code</h4>
                    <p className="text-sm">{individualData.address?.postalCode || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                  <Phone className="h-5 w-5" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {individualData.contacts.map((contact, index) => (
                  <div key={index} className="p-3 border rounded-md flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getContactTypeIcon(contact.contact_type)}
                      <span className="text-sm font-medium">{contact.contact_type}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{contact.contact_data}</p>
                    </div>
                    {contact.is_primary && (
                      <div className="flex items-center gap-1 text-primary text-xs font-medium">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {individualData.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                    <FileText className="h-5 w-5" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{individualData.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )
      default:
        return null
    }
  }

  // Render business form step content
  const renderBusinessStepContent = () => {
    switch (currentStep) {
      case "personal":
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                <Building2 className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={businessForm.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Business Name
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={businessForm.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Display Name
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <BadgeInfo className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>Name that will be displayed in the system</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={businessForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Country
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4">
                  <FormField
                    control={businessForm.control}
                    name="isTaxRegistered"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className={field.value ? "border-primary text-primary" : ""}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className={field.value ? "text-primary" : ""}>Tax Registered</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {businessForm.watch("isTaxRegistered") && (
                <FormField
                  control={businessForm.control}
                  name="taxNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>
        )
      case "address":
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={businessForm.control}
                  name="address.address1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={businessForm.control}
                  name="address.address2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" {...field} value={field.value || ""} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={businessForm.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={businessForm.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={businessForm.control}
                  name="address.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )
      case "contact":
        return (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                  <Phone className="h-5 w-5" />
                  Contact Details
                  <span className="text-destructive">*</span>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() =>
                    businessContactsArray.append({
                      contact_type: "email",
                      contact_data: "",
                      is_primary: businessContactsArray.fields.length === 0,
                    })
                  }
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {businessContactsArray.fields.map((field, index) => {
                const isPrimary = businessForm.watch(`contacts.${index}.is_primary`)
                const contactType = businessForm.watch(`contacts.${index}.contact_type`)

                return (
                  <Card
                    key={field.id}
                    className={cn("overflow-hidden border", isPrimary ? "border-primary bg-primary/5" : "")}
                  >
                    <CardContent className="p-4">
                      <div className="grid grid-cols-[1fr_auto] gap-4">
                        <div className="grid grid-cols-[1fr_2fr] gap-4">
                          <FormField
                            control={businessForm.control}
                            name={`contacts.${index}.contact_type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="pl-3">
                                      <div className="flex items-center gap-2">
                                        {getContactTypeIcon(contactType)}
                                        <SelectValue placeholder="Select type" />
                                      </div>
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="email">
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="phone">
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Phone
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="mobile">
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Mobile
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="landline">
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Landline
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="other">
                                      <div className="flex items-center gap-2">
                                        <Contact className="h-4 w-4" />
                                        Other
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={businessForm.control}
                            name={`contacts.${index}.contact_data`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Contact</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    {contactType === "email" && (
                                      <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    )}
                                    {(contactType === "phone" ||
                                      contactType === "mobile" ||
                                      contactType === "landline") && (
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                      )}
                                    {contactType === "other" && (
                                      <Contact className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    )}
                                    <Input className="pl-9" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex items-end space-x-2">
                          <FormField
                            control={businessForm.control}
                            name={`contacts.${index}.is_primary`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-end space-x-2">
                                <FormControl>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked)
                                        // If this is being set as primary, set others to not primary
                                        if (checked) {
                                          businessContactsArray.fields.forEach((_, i) => {
                                            if (i !== index) {
                                              businessForm.setValue(`contacts.${i}.is_primary`, false)
                                            }
                                          })
                                        }
                                      }}
                                      className={cn(isPrimary ? "border-primary text-primary" : "")}
                                    />
                                    <FormLabel
                                      className={cn(
                                        "text-sm font-normal flex items-center gap-1",
                                        isPrimary ? "text-primary font-medium" : "",
                                      )}
                                    >
                                      {isPrimary && <Star className="h-3 w-3 fill-primary text-primary" />}
                                      Primary
                                    </FormLabel>
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          {businessContactsArray.fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => businessContactsArray.remove(index)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </CardContent>
          </Card>
        )
      case "additional":
        return (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={businessForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Additional information about this business"
                        className="min-h-[100px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )
      case "review":
        const businessData = businessForm.getValues()
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                  <Building2 className="h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Business Name</h4>
                  <p className="text-sm">{businessData.businessName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Display Name</h4>
                  <p className="text-sm">{businessData.displayName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Country</h4>
                    <p className="text-sm">{businessData.country}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Tax Status</h4>
                    <p className="text-sm flex items-center gap-2">
                      {businessData.isTaxRegistered ? (
                        <span className="text-primary flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Tax Registered
                        </span>
                      ) : (
                        "Not Tax Registered"
                      )}
                    </p>
                  </div>
                </div>
                {businessData.isTaxRegistered && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Tax Number</h4>
                    <p className="text-sm">{businessData.taxNumber || "—"}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Address Line 1</h4>
                    <p className="text-sm">{businessData.address?.address1 || "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Address Line 2</h4>
                    <p className="text-sm">{businessData.address?.address2 || "—"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">City</h4>
                    <p className="text-sm">{businessData.address?.city || "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Country</h4>
                    <p className="text-sm">{businessData.address?.country || "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Postal Code</h4>
                    <p className="text-sm">{businessData.address?.postalCode || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                  <Phone className="h-5 w-5" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {businessData.contacts.map((contact, index) => (
                  <div key={index} className="p-3 border rounded-md flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getContactTypeIcon(contact.contact_type)}
                      <span className="text-sm font-medium">{contact.contact_type}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{contact.contact_data}</p>
                    </div>
                    {contact.is_primary && (
                      <div className="flex items-center gap-1 text-primary text-xs font-medium">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {businessData.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-md font-medium flex items-center gap-2 text-primary">
                    <FileText className="h-5 w-5" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{businessData.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create New Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {!customerType ? (
              <>
                <UserCircle className="h-6 w-6 text-primary" />
                Create New Customer
              </>
            ) : customerType === "individual" ? (
              <>
                <User className="h-6 w-6 text-primary" />
                Create Individual Customer
              </>
            ) : (
              <>
                <Building2 className="h-6 w-6 text-primary" />
                Create Business Customer
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Add a new customer to your database. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {!customerType ? (
          <div className="grid grid-cols-2 gap-6 py-6">
            <Button
              variant="outline"
              className="h-36 flex flex-col items-center justify-center gap-3 p-6 border-2 hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => handleCustomerTypeSelect("individual")}
            >
              <User className="h-12 w-12 text-primary" />
              <div className="text-center">
                <div className="text-lg font-medium">Individual</div>
                <div className="text-sm text-muted-foreground">Create a personal customer</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-36 flex flex-col items-center justify-center gap-3 p-6 border-2 hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => handleCustomerTypeSelect("business")}
            >
              <Building2 className="h-12 w-12 text-primary" />
              <div className="text-center">
                <div className="text-lg font-medium">Business</div>
                <div className="text-sm text-muted-foreground">Create a business customer</div>
              </div>
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab || undefined} onValueChange={handleTabChange} className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger
                value="individual"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <User className="h-4 w-4 mr-2" />
                Individual
              </TabsTrigger>
              <TabsTrigger
                value="business"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Business
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="mt-0 space-y-6">
              <Form {...individualForm}>
                <form onSubmit={individualForm.handleSubmit(onSubmitIndividual)} className="space-y-6">
                  <StepIndicator steps={individualSteps} />

                  {renderIndividualStepContent()}

                  <div className="flex justify-between mt-6">
                    {currentStep !== "personal" && (
                      <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </Button>
                    )}
                    {currentStep === "personal" && (
                      <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                      </Button>
                    )}

                    {currentStep !== "review" ? (
                      <Button type="button" onClick={nextStep} className="gap-2 ml-auto">
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      // <Button type="submit" className="gap-2 ml-auto">
                      //   <User className="h-4 w-4" />
                      //   Create Individual Customer
                      // </Button>
                      <Button type="button" onClick={() => individualForm.handleSubmit(onSubmitIndividual)()} className="gap-2 ml-auto">
                        <User className="h-4 w-4" />
                        Create Individual Customer
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="business" className="mt-0 space-y-6">
              <Form {...businessForm}>
                <form onSubmit={businessForm.handleSubmit(onSubmitBusiness)} className="space-y-6">
                  <StepIndicator steps={businessSteps} />

                  {renderBusinessStepContent()}

                  <div className="flex justify-between mt-6">
                    {currentStep !== "personal" && (
                      <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </Button>
                    )}
                    {currentStep === "personal" && (
                      <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                      </Button>
                    )}

                    {currentStep !== "review" ? (
                      <Button type="button" onClick={nextStep} className="gap-2 ml-auto">
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" className="gap-2 ml-auto">
                        <Building2 className="h-4 w-4" />
                        Create Business Customer
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

