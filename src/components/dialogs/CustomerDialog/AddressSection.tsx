import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COUNTRIES } from "@/lib/constants/countries"
import { Card, CardContent } from "@/components/ui/card"
import { AddressDetails } from "@/server/db/schema"
import { UseFormRegister, FieldValues, Controller, Control } from "react-hook-form" // Import RHF types
import LocationSelector, { CountryProps } from "@/components/ui/location-input"
import { useCallback, useState } from "react"

interface AddressSectionProps<TFieldValues extends FieldValues = FieldValues> { // Make props generic
  initialData?: AddressDetails | null
  register: UseFormRegister<TFieldValues> // Use the generic type
  initialCountry?: CountryProps | null
  control: Control<TFieldValues> // Accept control object

}



export default function AddressSection<TFieldValues extends FieldValues = FieldValues>({ 
  initialData = null, register, initialCountry=null, control }: AddressSectionProps<TFieldValues>) { // Make component generic
  const [selectedCountry, setCountry] = useState<CountryProps | null>()

  const handleCountryChange = useCallback((country: any) => {
    setCountry(country)
  }, [])


  return (
    <Card className="w-full border-dashed">
      <CardContent className="pt-4">
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          <div>
            <Label htmlFor="address.address1">Street Address</Label>
            {/* <Input id="address.address1" name="address.address1" defaultValue={initialData?.address1?? ''} /> */}
            <Input id="address.address1" {...register("address.address1" as any)} defaultValue={initialData?.address1 ?? ''} />

          </div>
          <div>
            <Label htmlFor="address.address2">Apartment/Suite</Label>
            {/* <Input id="address.address2" name="address.address2" defaultValue={initialData?.address2?? ''} /> */}
            <Input id="address.address2" {...register("address.address2" as any)} defaultValue={initialData?.address2 ?? ''} />

          </div>
          <div>
            <Label htmlFor="address.city">City</Label>
            {/* <Input id="address.city" name="address.city" defaultValue={initialData?.city?? ''} /> */}
            <Input id="address.city" {...register("address.city" as any)} defaultValue={initialData?.city ?? ''} />

          </div>
          <div>
            <Label htmlFor="address.postalCode">Postal Code</Label>
            {/* <Input id="address.postalCode" name="address.postalCode" defaultValue={initialData?.postalCode?? ''} /> */}
            <Input id="address.postalCode" {...register("address.postalCode" as any)} defaultValue={initialData?.postalCode ?? ''} />

          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address.country">Address Country</Label>
            {/* RHF doesn't directly register Select, handle via Controller or watch/setValue if needed, or keep name for FormData */}
            {/* For simplicity with server actions, keeping the name might be okay if you adjust server-side parsing */}
            {/* Or use RHF's Controller component for better integration */}
            <Controller
              name={"address.country" as any} // Use 'as any' or ensure 'address.country' is a valid path in TFieldValues
              control={control}
              render={({ field }) => {
                // Find the full CountryProps object based on the name stored in the form state (field.value)
                // Make sure countriesData is imported correctly

                return (
                  <LocationSelector
                    isStateNeeded={false}
                    initialCountry={field.value} // Pass the found object to LocationSelector
                    // initialCountry={initialData?.country} // Pass the found object to LocationSelector
                    onCountryChange={(country: CountryProps | null) => {
                      field.onChange(country?.name ?? ''); // Update form state with the country name string
                    }}
                  />
                );
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
