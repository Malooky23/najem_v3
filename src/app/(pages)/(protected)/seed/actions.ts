'use server';
import { db } from "@/server/db"
import { items } from "@/server/db/schema"

export async function create(formData: FormData) {
    const count = Number(formData.get('count') || 1);
    const createdItems = [];
    const uniqueItems = new Set<string>(); // To track unique item identifiers

    // Define more varied randomization options
    const itemTypes = ["BOX", "BAG", "CONTAINER", "PALLET", "CRATE", "ENVELOPE", "TUBE", "ROLL"];
    const countries = ["USA", "China", "Germany", "Japan", "France", "UK", "India", "Brazil", "Italy", "Canada"];
    
    for (let i = 0; i < count; i++) {
        let randomItemName: string,
            randomBrand: string,
            randomModel: string,
            randomCountry: string,
            randomWidth: number,
            randomHeight: number,
            randomLength: number,
            randomWeight: number,
            randomNotes: string,
            randomBarcode: string,
            randomType: string;

        let uniqueId: string;
        let validatedFields;

        // Generate unique items
        let isUnique = false;
        let attempts = 0;
        do {
            randomItemName = generateRandomName() + " " + Math.floor(10000 + Math.random() * 90000);
            randomBrand = generateRandomWord(Math.floor(Math.random() * 7) + 3);
            randomModel = generateRandomWord(Math.floor(Math.random() * 4) + 2) + " " + 
                           generateRandomWord(Math.floor(Math.random() * 5) + 3);
            randomCountry = countries[Math.floor(Math.random() * countries.length)];
            randomWidth = Math.floor(Math.random() * 991) + 10; // Random width between 10 and 1000
            randomHeight = Math.floor(Math.random() * 991) + 10; // Random height between 10 and 1000
            randomLength = Math.floor(Math.random() * 991) + 10; // Random length between 10 and 1000
            randomWeight = Math.floor(Math.random() * 9901) + 100; // Random weight between 100 and 10000 grams
            randomNotes = Math.random() > 0.3 ? generateRandomSentence() : ""; // 30% chance of no notes
            randomBarcode = generateRandomAlphanumeric(13);
            randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];

            uniqueId = `${randomItemName}-${randomBrand}-${randomModel}`; // Create a unique identifier
            if (!uniqueItems.has(uniqueId)) {
                isUnique = true;
                uniqueItems.add(uniqueId);
            }
            attempts++;
            if (attempts > 100) {
                console.warn("Failed to generate a unique item after 100 attempts.");
                return { success: false, error: "Failed to generate a unique item", items: createdItems };
            }
        } while (!isUnique);

        validatedFields = {
            success: true,
            data: {
                itemName: randomItemName,
                itemType: randomType,
                itemBrand: randomBrand,
                itemModel: randomModel,
                itemBarcode: randomBarcode,
                itemCountryOfOrigin: randomCountry,
                dimensions: {
                    width: randomWidth,
                    height: randomHeight,
                    length: randomLength,
                },
                weightGrams: randomWeight,
                customerId: "3d69251e-b019-44c4-a3a8-1d762e9f9a08",
                notes: randomNotes,
                createdBy: "4bb68f57-fc14-4e49-96a4-f26c75418547"
            },
            error: null,
        };

        try {
            const newItem = await db.insert(items).values(validatedFields.data).returning();
            createdItems.push(newItem[0]);
        } catch (error) {
            console.error("Database error:", error);
            return { success: false, error: "Failed to create item", items: createdItems };
        }
    }

    return { success: true, items: createdItems };

    function generateRandomName() {
        const adjectives = ["Awesome", "Shiny", "Cool", "Fantastic", "Amazing", "Elegant", "Premium", 
                           "Standard", "Basic", "Professional", "Deluxe", "Portable", "Sturdy", "Durable"];
        const nouns = ["Widget", "Gadget", "Thingamajig", "Doodad", "Contraption", "Package", "Box", 
                      "Container", "Kit", "Set", "Collection", "Bundle", "Pack", "Unit", "Component"];
        return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
    }

    function generateRandomWord(length: number) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    function generateRandomSentence() {
        const words = [];
        const wordCount = Math.floor(Math.random() * 10) + 5; // 5 to 14 words
        for (let i = 0; i < wordCount; i++) {
            words.push(generateRandomWord(Math.floor(Math.random() * 6) + 3)); // 3 to 8 characters
        }
        return words.join(' ') + '.';
    }

    function generateRandomAlphanumeric(length:number){
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

