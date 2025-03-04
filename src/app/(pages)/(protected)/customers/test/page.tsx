'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircleIcon } from "lucide-react";
import { createIndividualCustomer } from "../actions";

export default function Page() {
  async function testCustomerCreation() {
    try {
      const result = await createIndividualCustomer({
        firstName: "Test",
        lastName: "User",
        displayName: "Test User",
        country: "SE",
        contacts: [
          {
            contact_type: "email",
            contact_data: "malooky23@gmail.com",
            is_primary: true
          }
        ]
      });
      
      console.log('Customer creation result:', result);
    } catch (error) {
      console.error('Failed to create test customer:', error);
    }
  }

  return (
    <div className="p-4">
      <div className='flex flex-row gap-4 items-center'>
        <Link href={'/customers'}>
          <ArrowLeftCircleIcon className="mx-4"/>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Email Test</h1>
        <Button onClick={testCustomerCreation}>Create Customer with Email</Button>
      </div>
    </div>
  );
}