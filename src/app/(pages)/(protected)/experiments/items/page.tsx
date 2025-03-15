'use client'
import { Button } from "@/components/ui/button";
import { useCreateItem, useItemsQuery } from "@/hooks/data/useItems";
import { CreateItemsSchemaType, ItemSchemaType } from '@/types/items';


export default function ItemsTestPage() {
    const createItem = useCreateItem();
    const { data, error, isLoading, isError, status } = useItemsQuery();
    
    const createItemData: CreateItemsSchemaType = {
        itemName: "TEST ITEM TEST 3",
        itemType: "BOX",
        createdBy: "4bb68f57-fc14-4e49-96a4-f26c75418547",
        customerId: "9f122b72-44b5-4bc5-9ad5-9b2cffec8b43"
    }
    
    const handleCreateItem = () => {
        createItem.mutate(createItemData);
    }
    
    return (
        <div className="flex flex-col justify-center p-4 text-center h-screen m-4">
            <h1>Items Test Page</h1>
            
            {/* Query status */}
            {isLoading ? <p>Loading items...</p> : <p>Items loaded</p>}
            {isError ? <p>Error: {error?.message}</p> : null}
            {status && <p>Status: {status}</p>}
            
            {/* Mutation button and status */}
            <Button 
                onClick={handleCreateItem} 
                disabled={createItem.isPending}
            >
                {createItem.isPending ? 'Creating...' : 'Create Item'}
            </Button>
            
            {/* Mutation results */}
            {createItem.isSuccess && (
                <div className="mt-2 p-2 border rounded">
                    <p className="text-green-600">Item Created Successfully!</p>
                    <pre className="text-sm text-left">
                        {JSON.stringify(createItem.data, null, 2)}
                    </pre>
                </div>
            )}
            
            {createItem.isError && (
                <div className="mt-2 p-2 border rounded bg-red-50">
                    <p className="text-red-600">Error creating item: {createItem.error.message}</p>
                </div>
            )}
            
            {/* Display items */}
            <div className="mt-4">
                <h2 className="text-lg font-bold">Items List</h2>
                <ol className="list-decimal">
                    {data?.map((item: ItemSchemaType) => (
                        <li key={item.itemId} className="text-left">
                            {item.itemName}
                        </li>
                    )).slice(0, 5)}
                </ol>
            </div>
        </div>
    )
}