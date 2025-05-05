import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sackSizeTypeSchema, sackSizeType } from '@/server/db/schema'; // Import allowed types
import { FormSackSizeType } from './OrderExpenseDialog'; // Import the type used in the main form


// const SACK_SIZES = ["LARGE", "SMALL"] as const
// --- Types & Schema ---

// Schema for the SackSizeDialog form data
const sackDialogFormSchema = z.object({
    LARGE: z.coerce.number().min(0).optional(),
    SMALL: z.coerce.number().min(0).optional(),
    OTHER: z.coerce.number().min(0).optional()
});
type SackDialogFormValues = z.infer<typeof sackDialogFormSchema>;

interface SackSizeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sackSizes: FormSackSizeType[], totalQuantity: number) => void;
    initialData: FormSackSizeType[]; // Expecting the structure used in the main form
    expenseItemName: string;
}

export function SackSizeDialog({
    isOpen,
    onClose,
    onSave,
    initialData,
    expenseItemName
}: SackSizeDialogProps) {

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<SackDialogFormValues>({
        resolver: zodResolver(sackDialogFormSchema),
        defaultValues: {
            LARGE: 0,
            SMALL: 0,
            OTHER: 0,
        }
    });

    // --- Effect to populate form with initial data ---
    useEffect(() => {
        // Run only when the dialog is open
        if (isOpen) {
            console.log("SackDialog: useEffect running - isOpen=true. Initializing form with data:", initialData);

            // Start with all known form fields set to 0
            const defaultValues: SackDialogFormValues = {
                LARGE: 0,
                SMALL: 0,
                OTHER: 0,
            };

            // If initialData exists and is an array, populate the defaults
            if (Array.isArray(initialData)) {
                initialData.forEach(sack => {
                    // Check if the sackType is a valid key in our form values
                    if (sack.sackType === 'LARGE') {
                        defaultValues.LARGE = sack.amount;
                    } else if (sack.sackType === 'SMALL') {
                        defaultValues.SMALL = sack.amount;
                    } else if (sack.sackType === 'OTHER') {
                        defaultValues.OTHER = sack.amount;
                    }
                });
            } else {
                console.log("SackDialog: initialData is null or not an array, resetting to zeros.");
            }

            console.log("SackDialog: Resetting form with defaults:", defaultValues);
            // Use reset to update the form's values
            reset(defaultValues);
        }
        // Dependency array: run effect when isOpen, initialData, or reset changes
    }, [ isOpen, initialData, reset ]);


    const handleFormSubmit = (data: SackDialogFormValues) => {
        const totalQuantity = (data.LARGE ?? 0) + (data.SMALL ?? 0) //+ (data.OTHER ?? 0);

        // Convert form data back to the array structure
        const newSackSizes: FormSackSizeType[] = [];
        if (data.LARGE && data.LARGE > 0) newSackSizes.push({ sackType: 'LARGE', amount: data.LARGE });
        if (data.SMALL && data.SMALL > 0) newSackSizes.push({ sackType: 'SMALL', amount: data.SMALL });
        if (data.OTHER && data.OTHER > 0) newSackSizes.push({ sackType: 'OTHER', amount: data.OTHER });

        // --- Pass both array and total sum ---
        onSave(newSackSizes, totalQuantity);
        onClose();

    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Enter Sack Sizes</DialogTitle>
                        <DialogDescription>
                            Enter the quantity for each sack size used for the expense item: "{expenseItemName}".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {sackSizeType.enumValues.filter((sackType) => sackType !== "OTHER").map((sackType) => (
                            <div key={sackType} className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={`sack-${sackType}`} className="text-right">
                                    {sackType.charAt(0) + sackType.slice(1).toLowerCase()}
                                </Label>
                                {/* <Controller
                                    name={sackType} // Matches keys in SackDialogFormValues
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id={`sack-${sackType}`}
                                            type="number"
                                            // min="0"
                                            className="col-span-3"
                                            {...field}
                                            value={field.value?.toString() === "" ? 0 : field.value?.toString() }
                                            // onChange={e => 
                                            //     field.onChange((parseInt(e.target.value)) ?? 0 )} // Ensure value is number
                                        />
                                    )}
                                /> */}
                                {/* <Controller
                                    name={sackType} // Matches keys in SackDialogFormValues
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id={`sack-${sackType}`}
                                            type="number"
                                            className="col-span-3"
                                            {...field}
                                            value={field.value === 0 ? "" : field.value?.toString()}
                                            onChange={(e) => {
                                                const stringValue = e.target.value;
                                                if (stringValue === "") {
                                                    field.onChange(0);
                                                } else {
                                                    const numberValue = parseInt(stringValue);
                                                    field.onChange(isNaN(numberValue) ? 0 : numberValue);
                                                }
                                            }}
                                        />
                                    )}
                                /> */}
                                <Controller
                                    name={sackType} // Matches keys in SackDialogFormValues
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id={`sack-${sackType}`}
                                            type="number"
                                            className="col-span-3"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) => {
                                                const numValue = e.target.value === "" ? null : (Number.parseInt(e.target.value))
                                                if (numValue !== null) {
                                                    field.onChange(numValue)
                                                } else {
                                                    field.onChange(null)
                                                }
                                            }}
                                        />
                                    )}
                                />
                                {errors[ sackType ] && (
                                    <p className="col-span-4 text-xs text-destructive text-right">{errors[ sackType ]?.message}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting || !isValid}>
                            Save Sizes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}