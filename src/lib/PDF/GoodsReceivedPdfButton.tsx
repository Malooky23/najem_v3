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
    const isMobile = useIsMobileTEST()
    useEffect(() => {
        setIsClient(true);
    }, []);

    const MyDocument = useMemo(() => (
        <GoodsReceivedDocument data={orderData} imageStaticData={imageStaticData} />
    ), [ orderData, imageStaticData ]);

    const [ instance, updateInstance ] = usePDF();

    useEffect(() => {
        if (isDialogOpen && isClient && MyDocument && updateInstance) {
            console.log("Effect: Dialog open, client, MyDocument ready. Calling updateInstance.");
            updateInstance(MyDocument);
        }
    }, [ isDialogOpen, MyDocument, updateInstance ]); 

    const handleOpenInNewTab = () => {
        if (instance?.url) {
            window.open(instance.url, '_blank');
        } else if (!instance?.loading && isClient && MyDocument && updateInstance) {
            updateInstance(MyDocument); 
        }
    };

    const onDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
    };




    return (
        <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
            <DialogTrigger asChild>
                {children ? (
                    React.Children.only(children)
                ) : (
                    <Button variant="outline" className={triggerClassName}>
                        {buttonText}
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className={`rounded-md flex flex-col w-[90vw] p-0 ${isMobile ?
                "w-[95vw]" : " max-w-6xl h-[90vh]"}`}>
                <DialogHeader className="p-4 border-b  h-fit">
                    <DialogTitle>Goods Received Form</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>

                {!isMobile && (
                    <div className="p-4 h-full ">
                        <PDFViewer showToolbar={false} height="100%" width={"100%"} className='flex flex-grow min-h-0 h-full rounded-md '>
                            {MyDocument}
                        </PDFViewer>
                    </div>
                )}

                <DialogFooter className={cn(!isMobile && "border-t", "flex py-4 px-4 mb-6")}>

                    <div className={cn("flex justify-center ", isMobile ? " flex-col gap-2" :
                        "flex-row gap-6 w-full "
                    )}>
                        <PDFDownloadLink document={MyDocument} fileName={fileName} className="hidden md:block"
                        >
                            <Button variant="outline"
                                size={"sm"}
                            >
                                <Download className="h-4 w-4 " />
                                Download
                            </Button>
                        </PDFDownloadLink>

                        <Button variant="outline" onClick={handleOpenInNewTab}
                            size={"sm"}
                        >
                            <Printer className="h-4 w-4 " />
                            Print
                        </Button>

                        < DialogClose asChild>
                            <Button variant="outline" size="sm">
                                Close
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
};

export default GoodsReceivedPdfButton;
