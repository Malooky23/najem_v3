// src/lib/PDF/GoodsReceivedPdfButton.tsx
'use client';

import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { PDFDownloadLink, usePDF } from '@react-pdf/renderer';
import { GoodsReceivedDocument } from './GoodsReceivedDocument';

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { EnrichedOrderSchemaType } from '@/types/orders';

interface GoodsReceivedPdfButtonProps {
    orderData: EnrichedOrderSchemaType;
    imageStaticData: {
        formDate: string;
        receiveDate: string;
        customerRef?: string;
        orderNoIntRef: string;
        receiverName: string;
        receiverMobile: string;
        receiverEid: string;
    }
    buttonText?: string;
    fileName?: string;
    children?: ReactNode;
    triggerClassName?: string;
}

export const GoodsReceivedPdfButton: React.FC<GoodsReceivedPdfButtonProps> = ({
    orderData,
    imageStaticData,
    buttonText = "View Goods Received Form",
    fileName: initialFileName,
    children,
    triggerClassName
}) => {
    const [ isClient, setIsClient ] = useState(false);
    const [ isDialogOpen, setIsDialogOpen ] = useState(false);

    const fileName = initialFileName || `GoodsReceived_${orderData.orderNumber}.pdf`;

    useEffect(() => {
        setIsClient(true);
    }, []);

    const MyDocument = useMemo(() => {
        // console.log("MyDocument memo re-evaluated");
        return <GoodsReceivedDocument data={orderData} imageStaticData={imageStaticData} />;
    }, [ orderData, imageStaticData ]);

    // usePDF hook
    // Initialize with null and update when MyDocument is ready and dialog opens
    const [ instance, updateInstance ] = usePDF();

    // Effect to trigger PDF generation/update when dialog opens or document changes
    useEffect(() => {
        if (isDialogOpen && isClient && MyDocument && updateInstance) {
            // console.log("Effect: Dialog open, client, MyDocument ready. Calling updateInstance.");
            updateInstance(MyDocument);
        }
    }, [ isDialogOpen, isClient, MyDocument, updateInstance ]); // updateInstance should be stable from usePDF

    const handleOpenInNewTab = () => {
        if (instance?.url) {
            window.open(instance.url, '_blank');
        } else if (!instance?.loading && isClient && MyDocument && updateInstance) {
            // console.log("New Tab: URL not ready, attempting updateInstance.");
            updateInstance(MyDocument); // Attempt to generate if not available
        }
    };

    // This function is passed to onOpenChange
    const onDialogOpenChange = (open: boolean) => {
        // console.log("onDialogOpenChange called with:", open);
        setIsDialogOpen(open);
        // The useEffect above will handle calling updateInstance when `open` becomes true.
        // No need to call updateInstance directly here anymore, as the effect is more robust.
    };

    if (!isClient) {
        if (children) return <>{children}</>;
        return <Button disabled className={triggerClassName}>{buttonText}</Button>;
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
            <DialogTrigger asChild>
                {children ? (
                    // When using `asChild`, DialogTrigger expects a single child that can accept a ref and props.
                    // A simple div might not always work as expected by Shadcn's trigger.
                    // If `children` is a button or interactive element, it should work.
                    // For complex children, ensure the outermost element can receive props.
                    React.Children.only(children) // Ensures children is a single element for asChild
                ) : (
                    <Button variant="outline" className={triggerClassName}>
                        {buttonText}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Goods Received Form Preview</DialogTitle>
                    <DialogDescription>
                        Review the goods received form. You can download it or open it in a new tab.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-grow min-h-0 h-full rounded-md border p-1 my-4">
                    {instance?.loading && (
                        <div className="flex items-center justify-center h-full">
                            <p>Loading PDF preview...</p>
                        </div>
                    )}
                    {!instance?.loading && instance?.url && (
                        <iframe
                            key={instance.url}
                            src={instance.url}
                            className="w-full h-full"
                            title="PDF Preview"
                        />
                    )}
                    {!instance?.loading && !instance?.url && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="mb-2">
                                {instance?.error ? "Failed to load PDF preview." : "PDF preview will appear here."}
                            </p>
                            {instance?.error && <p className="text-red-500 text-sm">{instance.error.toString()}</p>}
                            {!instance?.error && isDialogOpen && MyDocument && updateInstance && (
                                <Button onClick={() => updateInstance(MyDocument)} variant="outline" className="mt-4" disabled={instance?.loading}>
                                    Generate Preview
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:justify-end">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleOpenInNewTab}
                        disabled={!instance?.url || instance?.loading}
                        variant="outline"
                    >
                        Open in New Tab
                    </Button>
                    {MyDocument && ( // Ensure MyDocument is defined before rendering PDFDownloadLink
                        <PDFDownloadLink document={MyDocument} fileName={fileName}>
                            {({ loading: downloadLinkLoading }) => (
                                <Button disabled={downloadLinkLoading || instance?.loading || !instance?.url}>
                                    {downloadLinkLoading ? 'Preparing...' : 'Download PDF'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default GoodsReceivedPdfButton;