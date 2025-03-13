import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COUNTRIES } from "@/lib/constants/countries"
import { Card, CardContent } from "@/components/ui/card"

export default function AddressSection() {
  return (
    <Card className="w-full border-dashed">
      <CardContent className="pt-4">
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          <div>
            <Label htmlFor="address.address1">Street Address</Label>
            <Input id="address.address1" name="address.address1" />
          </div>
          <div>
            <Label htmlFor="address.address2">Apartment/Suite</Label>
            <Input id="address.address2" name="address.address2" />
          </div>
          <div>
            <Label htmlFor="address.city">City</Label>
            <Input id="address.city" name="address.city" />
          </div>
          <div>
            <Label htmlFor="address.postalCode">Postal Code</Label>
            <Input id="address.postalCode" name="address.postalCode" />
          </div>
          <div className="md:col-span-2">
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
        </div>
      </CardContent>
    </Card>
  )
}
