"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GenerateItems } from "./itemseeder";
import { adjectives, nouns, busType } from "./consts";

// Define the shape of your raw JSON customer object.
interface RawBusinessCustomer {
  country: string;
  business_name: string;
  is_tax_registered: boolean;
  tax_number: number | string;
  address: {
    address_1: string;
    address_2: string;
    city: string;
    postal_code: string;
  };
  contacts: Array<{ type: string; value: string | number }>;
}

/**
 * Generate a random business name by combining a random adjective and noun.
 */
function generateRandomBusinessName(): string {
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomBusType = busType[Math.floor(Math.random() * busType.length)];
  return `${randomAdjective} ${randomNoun} ${randomBusType}`;
}

/**
 * Transform the raw customer to match your API's expected shape.
 * If tax is registered, a random 15-digit number is generated; otherwise, null.
 */
function transformCustomer(raw: RawBusinessCustomer) {
  const taxNumber = raw.is_tax_registered
    ? String(Math.floor(Math.random() * 9e14 + 1e14))
    : null;

  return {
    country: raw.country,
    // Use a random business name instead of the one from JSON.
    businessName: generateRandomBusinessName(),
    isTaxRegistered: raw.is_tax_registered,
    taxNumber: taxNumber,
    address: {
      address1: raw.address.address_1,
      address2: raw.address.address_2,
      city: raw.address.city,
      postalCode: raw.address.postal_code,
    },
    contacts: raw.contacts.map((contact) => ({
      contact_type: contact.type,
      // Using 'contact_data' to match your API's expected key.
      contact_data: String(contact.value),
    })),
  };
}

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [successNames, setSuccessNames] = useState<string[]>([]);
  const [failedNames, setFailedNames] = useState<string[]>([]);
  // A ref to track if a stop was requested.
  const cancelledRef = useRef(false);

  const handleSeed = async () => {
    setLoading(true);
    setMessage("");
    setSuccessCount(0);
    setFailCount(0);
    setSuccessNames([]);
    setFailedNames([]);
    cancelledRef.current = false;
    let loopCount = 0; // Initialize loop counter

    try {
      // Fetch the JSON file from the public folder
      const res = await fetch("/output.json");
      const rawCustomers: RawBusinessCustomer[] = await res.json();

      // Iterate over each raw customer record
      for (const rawCustomer of rawCustomers) {
        if (cancelledRef.current) break;
        if (loopCount >= 1000) break; // Stop after 10 loops

        const customer = transformCustomer(rawCustomer);

        try {
          // Post to your protected API route.
          const resPost = await fetch("/api/customers/business", {
            method: "POST",
            credentials: "include", // Ensure session cookies are sent
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(customer),
          });
          const data = await resPost.json();

          if (data.success) {
            setSuccessCount((prev) => prev + 1);
            setSuccessNames((prev) => [...prev, customer.businessName]);
          } else {
            setFailCount((prev) => prev + 1);
            setFailedNames((prev) => [...prev, customer.businessName]);
          }
        } catch (error: any) {
          setFailCount((prev) => prev + 1);
          setFailedNames((prev) => [...prev, customer.businessName]);
        }
        loopCount++; // Increment loop counter
      }

      if (cancelledRef.current) {
        setMessage("Seeding cancelled by user.");
      } else {
        setMessage("Seeding complete (10 loops)."); // Updated message
      }
    } catch (error: any) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    cancelledRef.current = true;
  };

  const [generateToggle, setGenerateToggle] = useState(true);

  // Updated async function to handle generating items.
  const TestItems = async () => {
    try {
      await GenerateItems(generateToggle);
      console.log("GenerateItems finished successfully.");
      setGenerateToggle((prev) => !prev);
    } catch (error) {
      console.error("Error calling GenerateItems:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-2xl font-bold">Test Items Seeder</h1>
        <Button onClick={TestItems}>CREATE NEW ITEM </Button>
      </div>
      <h1 className="text-2xl font-bold">Seed Business Customers</h1>
      <div className="flex space-x-4">
        <Button onClick={handleSeed} disabled={loading}>
          {loading ? "Seeding in progress" : "Run Seed Script"}
        </Button>
        {loading && (
          <Button variant="destructive" onClick={handleStop}>
            Stop Seeding
          </Button>
        )}
      </div>
      {message && <p>{message}</p>}
      <div>
        <p>Success: {successCount}</p>
        <ul>
          {successNames.map((name, idx) => (
            <li key={idx}>{name}</li>
          ))}
        </ul>
        <p>Failed: {failCount}</p>
        <ul>
          {failedNames.map((name, idx) => (
            <li key={idx}>{name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
