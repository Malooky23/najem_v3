// src/lib/PDF/GoodsReceivedPdfButton.tsx
'use client';

import React, { useState, useEffect, useMemo, ReactNode, memo } from 'react';
import { PDFDownloadLink, PDFViewer, usePDF } from '@react-pdf/renderer';
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

import { cn } from '../utils';
import Loading from '@/components/ui/loading';
import { useIsMobileTEST } from '@/hooks/use-media-query';
import { Download, Printer, X } from 'lucide-react';

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
    buttonText?: string; // Used if 'children' is not provided for the trigger
    fileName?: string;
    children?: ReactNode; // Content for the trigger button, or the trigger itself if complex
    triggerClassName?: string; // Optional class for the default button trigger
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
    const isMobile = useIsMobileTEST()
    useEffect(() => {
        setIsClient(true);
    }, []);

    const MyDocument = useMemo(() => (
        <GoodsReceivedDocument data={orderData} imageStaticData={imageStaticData} />
    ), [ orderData, imageStaticData ]);

    // usePDF hook
    // Initialize with null and update when MyDocument is ready and dialog opens
    const [ instance, updateInstance ] = usePDF();

    // Effect to trigger PDF generation/update when dialog opens or document changes
    useEffect(() => {
        if (isDialogOpen && isClient && MyDocument && updateInstance) {
            console.log("Effect: Dialog open, client, MyDocument ready. Calling updateInstance.");
            updateInstance(MyDocument);
        }
    }, [ isDialogOpen, MyDocument, updateInstance ]); // updateInstance should be stable from usePDF
    // }, [ isDialogOpen, isClient, MyDocument, updateInstance ]); // updateInstance should be stable from usePDF

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

    // if (!isClient) {
    //     if (children) return <>{children}</>;
    //     return <Button disabled className={triggerClassName}>{buttonText}</Button>;
    // }



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
            {/* <DialogContent className="sm:max-w-[800px] md:h-[90vh] h-fit flex flex-col sm:bg-red-500 bg-green-500 "> */}
            {/* <DialogContent
                 className={cn(
                    // "p-0 flex flex-col", // Use flex-col to structure header, content, footer
                    // Set width, responsive if needed
                    "w-[95vw] max-w-[600px] sm:w-[80vw] sm:max-w-[1000px]",
                    // Mobile: height is auto, grows with content, max 95vh to avoid full screen issues
                    "h-auto max-h-[95vh]",
                    // Desktop: DialogContent (the modal panel) itself will have a max-height of 90vh.
                    // The inner content div will scroll within this.
                    "sm:max-h-[90vh]",
                    "rounded-md"
                )}
            > */}


            <DialogContent className={`rounded-md flex flex-col w-[90vw] p-0 ${isMobile ?
                "w-[95vw]" : " max-w-6xl h-[90vh]"}`}>
                <DialogHeader className="p-4 border-b  h-fit">
                    {/* <DialogHeader className="p-4 sm:p-1 pb-0 shrink-0"> */}
                    <DialogTitle>Goods Received Form</DialogTitle>
                    <DialogDescription>
                        {/* Review the goods received form. You can download it or open it in a new tab. */}
                    </DialogDescription>
                </DialogHeader>

                {!isMobile && (
                    <div className="p-4 h-full ">
                        <PDFViewer showToolbar={false} height="100%" width={"100%"} className='flex flex-grow min-h-0 h-full rounded-md '>
                            {MyDocument}
                        </PDFViewer>
                    </div>
                )}

                {/* <DialogFooter className="py-4 mb-6 flex flex-row ">
                    {!isMobile &&
                        < DialogClose asChild>
                            <Button variant="outline" size="sm">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </DialogClose>
                    }

                    <div className="flex bg-amber-50 w-full px-2 gap-2">
                        <PDFDownloadLink document={MyDocument} fileName={fileName}
                        >
                            <Button variant="outline"  
                                className='bg-red-400'

                            >
                                <Download className="h-4 w-4 " />
                                Download
                            </Button>
                        </PDFDownloadLink>

                        <Button variant="outline"  onClick={handleOpenInNewTab} 
                        className='bg-blue-400'
                        >
                            <Printer className="h-4 w-4 " />
                            Print
                        </Button>
                    </div>
                </DialogFooter> */}

                <DialogFooter className={cn(!isMobile && "border-t", "flex py-4 px-4 mb-6")}>

                    {/* <div className="flex    w-full px-4 gap-2 space-y-4"> */}
                    <div className={cn("flex justify-center ", isMobile ? " flex-col gap-2" :
                        "flex-row gap-6 w-full "
                    )}>
                        <PDFDownloadLink document={MyDocument} fileName={fileName} className="hidden md:block"
                        >
                            <Button variant="outline"
                                // className='w-full justify-center'
                                size={"sm"}
                            >
                                <Download className="h-4 w-4 " />
                                Download
                            </Button>
                        </PDFDownloadLink>

                        <Button variant="outline" onClick={handleOpenInNewTab}
                            // className="  w-full justify-center"
                            size={"sm"}

                        >
                            <Printer className="h-4 w-4 " />
                            Print
                        </Button>

                        < DialogClose asChild>
                            <Button variant="outline" size="sm">
                                {/* <X className="h-4 w-4 mr-2" /> */}
                                Close
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
};

// export default GoodsReceivedPdfButton;
export default GoodsReceivedPdfButton;


// <div className=" min-h-0 h-full rounded-md border p-1 my-4 flex">
//     {/* {instance?.loading && (
//                         <div className="flex items-center justify-center h-full">
//                             <p>Loading PDF preview...</p>
//                         </div>
//                     )} */}
//     {/* {!instance?.loading  ?
//                      ( */}
//     <iframe
//         // key={instance.url ?? ""}
//         src={instance.url ?? ""}
//         className="w-full h-full bg-white"
//         title="PDF Preview"
//     />
//     {/* ): <Loading/>} */}

//     {/* <PDFViewer width="100%" height="100%" showToolbar={true} className="rounded-md ">
//                         {MyDocument}
//                     </PDFViewer> */}
//     {!instance?.loading && !instance?.url && (
//         <div className="flex flex-col items-center justify-center h-full text-center">
//             <p className="mb-2">
//                 {instance?.error ? "Failed to load PDF preview." : "PDF preview will appear here."}
//             </p>
//             {instance?.error && <p className="text-red-500 text-sm">{instance.error.toString()}</p>}
//             {!instance?.error && isDialogOpen && MyDocument && updateInstance && (
//                 <Button onClick={() => updateInstance(MyDocument)} variant="outline" className="mt-4" disabled={instance?.loading}>
//                     Generate Preview
//                 </Button>
//             )}
//         </div>
//     )}
// </div>