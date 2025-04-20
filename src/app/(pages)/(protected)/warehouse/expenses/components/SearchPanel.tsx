// src/app/(pages)/(protected)/warehouse/expenses/components/SearchPanel.tsx
'use client'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/useDebounce";
import { Trash2Icon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react" // Removed useCallback

// Define param names consistently
const SEARCH_PARAM = 'search';
const PAGE_PARAM = 'page';

export default function SearchPanel() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for the input field's value
    const [ inputValue, setInputValue ] = useState(() => searchParams.get(SEARCH_PARAM) || '');

    // Debounce the input value
    const debouncedValue = useDebounce(inputValue, 400);

    // Effect 1: Sync input value FROM URL if it changes externally
    useEffect(() => {
        const currentSearchInUrl = searchParams.get(SEARCH_PARAM) || '';
        if (inputValue !== currentSearchInUrl) {
            // console.log(`SearchPanel Effect 1: Syncing input FROM URL. Input='${inputValue}', URL='${currentSearchInUrl}'`); // Debug
            setInputValue(currentSearchInUrl);
        }
        // This effect should ONLY run when searchParams changes.
    }, [ searchParams ]); // Only depends on searchParams

    // Effect 2: Update URL based on the debounced input value
    useEffect(() => {
        const currentParams = new URLSearchParams(searchParams.toString());
        const currentSearchInUrl = currentParams.get(SEARCH_PARAM) || '';

        // *** ADD THIS CHECK ***
        // If the input field itself is currently empty, but a non-empty debounced value
        // arrives (likely stale after a clear), ignore it and don't update the URL.
        if (inputValue === '' && debouncedValue !== '') {
            console.log("SearchPanel Effect 2: Input is empty, ignoring stale debounced value:", debouncedValue); // Debug
            // However, if the debounced value *just became* empty, we *might* need to clear the URL
            if (debouncedValue === '' && currentSearchInUrl !== '') {
                // console.log("SearchPanel Effect 2: Debounced value became empty, clearing URL"); // Debug
                currentParams.delete(SEARCH_PARAM);
                currentParams.set(PAGE_PARAM, '1');
                router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
            }
            return; // Exit early, do not proceed with potentially stale update
        }
        // *** END OF ADDED CHECK ***

        let needsUrlUpdate = false;
        if (debouncedValue) {
            // If there's a non-empty debounced value (and input isn't empty due to the check above), update URL if needed.
            if (debouncedValue !== currentSearchInUrl) {
                currentParams.set(SEARCH_PARAM, debouncedValue);
                currentParams.set(PAGE_PARAM, '1');
                needsUrlUpdate = true;
                // console.log(`SearchPanel Effect 2: Setting search to '${debouncedValue}'`); // Debug
            }
        } else { // debouncedValue is empty
            // If debounced value is empty, remove search param from URL if it exists
            if (currentSearchInUrl) { // Only update if URL actually has a search term to remove
                currentParams.delete(SEARCH_PARAM);
                currentParams.set(PAGE_PARAM, '1');
                needsUrlUpdate = true;
                // console.log(`SearchPanel Effect 2: Clearing search from URL (debounced is empty)`); // Debug
            }
        }

        if (needsUrlUpdate) {
            router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
        }
        // else {
        //      console.log(`SearchPanel Effect 2: No URL update needed. Input='${inputValue}', Debounced='${debouncedValue}', URL Search='${currentSearchInUrl}'`); // Debug
        // }

        // Depend on inputValue as well now, because we read it directly for the check
        // Also depend on searchParams to ensure currentSearchInUrl is up-to-date for comparisons
    }, [ debouncedValue, inputValue, router, pathname, searchParams, SEARCH_PARAM, PAGE_PARAM ]);
    const clearSearch = () => {
        // const currentParams = new URLSearchParams(searchParams.toString());
        // currentParams.delete('search');
        // currentParams.set('page', '1');
        // router.push(`${pathname}?${currentParams.toString()}`);
        setInputValue('')
    }

    return (
        <>
        <Input
            className="bg-white"
            placeholder="Search expenses..."
            value={inputValue} // Controlled input
            onChange={(e) => setInputValue(e.target.value)} // Update local state on change
            />
            <Button
                variant="outline"
                size="icon"
                // onClick={() => router.push(pathname)} // Push to clear all params
                onClick={clearSearch} // Push to clear all params
                title="Clear all filters and sorting"
            >
                <Trash2Icon className="h-4 w-4" />
            </Button>
            </>
    );
}
