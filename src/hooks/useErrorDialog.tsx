'use client'
import React, { useState, useCallback } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Adjust the import path if needed

interface ErrorDialogState {
    isOpen: boolean;
    title: string;
    message: string;
}

interface UseErrorDialogReturn {
    showErrorDialog: (title: string, message: string) => void;
    ErrorDialogComponent: React.FC; // The component to render
}

export function useErrorDialog(): UseErrorDialogReturn {
    const [ dialogState, setDialogState ] = useState<ErrorDialogState>({
        isOpen: false,
        title: '',
        message: '',
    });

    // Function to open the dialog with specific content
    const showErrorDialog = useCallback((title: string, message: string) => {
        setDialogState({ isOpen: true, title, message });
    }, []);

    // Function to close the dialog
    const closeDialog = useCallback(() => {
        setDialogState((prevState) => ({ ...prevState, isOpen: false }));
        // Small delay to allow the closing animation before clearing text
        // setTimeout(() => {
        //   setDialogState({ isOpen: false, title: '', message: '' });
        // }, 150); 
        // Note: Clearing text might cause flicker if animation isn't instant.
        // Often better to just let it close. Re-opening will set new text anyway.
    }, []);

    // The actual AlertDialog component configured with our state
    const ErrorDialogComponent: React.FC = useCallback(() => {
        // Don't render anything if not open (or use the headless nature)
        // The <AlertDialog> component itself handles visibility via its `open` prop
        return (
            <AlertDialog open={dialogState.isOpen} onOpenChange={(open) => {
                if (!open) {
                    closeDialog();
                }
            }}>
                {/* <AlertDialogTrigger>Open</AlertDialogTrigger> // No trigger needed here */}
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialogState.title || 'Error'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {/* Allow rendering simple strings or React nodes */}
                            {typeof dialogState.message === 'string' ? (
                                <span style={{ whiteSpace: 'pre-wrap' }}>{dialogState.message}</span>
                            ) : (
                                dialogState.message
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        {/* <AlertDialogCancel onClick={closeDialog}>Cancel</AlertDialogCancel> // Often just "OK" is needed for errors */}
                        <AlertDialogAction onClick={closeDialog}>OK</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }, [ dialogState.isOpen, dialogState.title, dialogState.message, closeDialog ]);


    return { showErrorDialog, ErrorDialogComponent };
}