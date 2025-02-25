"use client"

import { ComboboxForm } from "@/components/ui/combobox"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"

export default function TestPage() {
  const form = useForm({
    defaultValues: {
      test: ""
    }
  })

  // Generate a large number of test options
  const testOptions = Array.from({ length: 50 }, (_, i) => ({
    label: `Test Option ${i + 1}`,
    value: `value-${i + 1}`
  }))

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Combobox Test Page</h1>
      
      <div className="max-w-md">
        <Form {...form}>
          <ComboboxForm
            name="test"
            label="Test Combobox"
            options={testOptions}
            placeholder="Select a test option..."
          />
        </Form>
      </div>
    </div>
  )
}