'use client'

import { CreateCustomerModal } from "@/components/OLD-CreateCustomerModal"
import { useState } from "react"

export function CreateCustomerButton({ type }: { type: "individual" | "business" }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className=" inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Create {type === 'individual' ? 'Individual' : 'Business'}
      </button>
      <CreateCustomerModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => setIsOpen(false)}
        type={type}
      />
    </>
  )
}
