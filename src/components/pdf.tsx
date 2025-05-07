import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Printer } from "lucide-react"


import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { EnrichedOrderSchemaType } from '@/types/orders';
import { arial } from '@/lib/constants/arial';

interface OrderDetailsPdfExportButtonProps {
    orderData: EnrichedOrderSchemaType;
}
const CUSTOM_FONT_BASE64 = arial;
const CUSTOM_FONT_TXT = ".src/lib/constants/arial.txt"
const CUSTOM_FONT_NAME = "times";
const companyName = "Najem Aleen Shipping LLC";

const addPageHeaderFooter = (doc: jsPDF, pageNumber: number, totalPages: number) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(companyName, margin, 10);
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, 10, { align: 'right' });
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy HH:mm')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
};

const OrderDetailsPdfExportButton: React.FC<OrderDetailsPdfExportButtonProps> = ({ orderData }) => {
    const [ isDialogOpen, setIsDialogOpen ] = useState(false);
    const [ pdfGenerationError, setPdfGenerationError ] = useState<string | null>(null);

    const generatePdf = () => {
        try {
            setPdfGenerationError(null);
            const doc = new jsPDF('p', 'pt', 'a4');
            let fontSuccessfullyRegistered = false;

            try {
                // doc.addFileToVFS(`${CUSTOM_FONT_NAME}.txt`, CUSTOM_FONT_BASE64);
                // doc.addFont(`${CUSTOM_FONT_NAME}.ttf`, CUSTOM_FONT_NAME, 'normal');
                // doc.addFont(`${CUSTOM_FONT_NAME}.ttf`, CUSTOM_FONT_NAME, 'bold');
                // doc.setFont(CUSTOM_FONT_NAME);
                fontSuccessfullyRegistered = true;
            } catch (e) {
                console.error("Failed to load/add custom font:", e);
                setPdfGenerationError("Failed to load custom font. PDF might not display all characters correctly.");
            }
            console.log(doc.getFontList())

            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            let currentY = margin + 10;

            const pageCount = doc.internal.pages.length;
            addPageHeaderFooter(doc, 1, pageCount);


            if (fontSuccessfullyRegistered) {
                doc.setFont('times');
            }

            doc.setFontSize(18);
            doc.setFont('times','bold');
            doc.text('Order Details', pageWidth / 2, currentY, { align: 'center' });
            currentY += 12;
            doc.setFont('times','normal');



            doc.setFontSize(10);
            const col1X = margin;
            const col2X = pageWidth / 2;

            doc.text(`Order #: ${orderData.orderNumber}`, col1X, currentY);
            currentY += 6;
            doc.text(`Date: ${format(new Date(orderData.createdAt), 'MMM d, yyyy, h:mm a')}`, col1X, currentY);
            currentY += 6;
            doc.text(`Status: ${orderData.status}`, col1X, currentY);
            currentY += 6;
            doc.text(`Customer: ${orderData.customerName || 'N/A'}`, col1X, currentY);
            currentY += 10;


            let specificsStartY = currentY;
            doc.text(`Type: ${orderData.orderType || 'N/A'}`, col1X, specificsStartY);
            doc.text(`Movement: ${orderData.movement || 'N/A'}`, col2X, specificsStartY);
            specificsStartY += 6;
            doc.text(`Packing: ${orderData.packingType || 'N/A'}`, col1X, specificsStartY);
            doc.text(`Delivery: ${orderData.deliveryMethod || 'N/A'}`, col2X, specificsStartY);
            specificsStartY += 6;
            doc.text(`Mark: ${orderData.orderMark || 'N/A'}`, col1X, specificsStartY);
            currentY = specificsStartY + 10;


            if (orderData.items && orderData.items.length > 0) {
                doc.setFontSize(12);
                doc.setFont('times','bold');
                doc.text('Order Items', margin, currentY);
                currentY += 7;
                doc.setFont('times','normal');

                autoTable(doc, {
                    startY: currentY,
                    head: [ [ '#', 'Item Name', 'Quantity' ] ],
                    body: orderData.items.map((item, index) => {
                        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                        return [
                            index + 1,
                            item.itemName,
                            quantity,
                        ];
                    }),
                    theme: 'grid',
                    styles: {
                        font: fontSuccessfullyRegistered ? CUSTOM_FONT_NAME : 'Helvetica',
                        fontSize: 9,
                        cellPadding: 2
                    },
                    headStyles: {
                        fillColor: [ 220, 220, 220 ], textColor: 20, fontStyle: 'bold',
                        font: fontSuccessfullyRegistered ? CUSTOM_FONT_NAME : 'Helvetica',
                    },
                    didDrawPage: (data) => {
                        addPageHeaderFooter(doc, data.pageNumber, doc.internal.pages.length);
                        currentY = margin + 10;
                    },
                });
                currentY = (doc as any).lastAutoTable.finalY + 10;
            } else {
                doc.setFontSize(10);
                doc.text('No items in this order.', margin, currentY);
                currentY += 10;
            }

            const totalsX = pageWidth - margin;
            const labelX = totalsX - 50;
            doc.text(`Items Total:`, labelX, currentY);
            doc.text(`${orderData.items.length.toFixed(2)}`, totalsX, currentY, { align: 'right' });
            currentY += 7;

            const finalTotalPages = pageCount;
            for (let i = 1; i <= finalTotalPages; i++) {
                doc.setPage(i);
            }
            doc.output('dataurlnewwindow');
            setIsDialogOpen(false);
        } catch (error: any) {
            console.error("Error generating PDF:", error);
            setPdfGenerationError(error.message || "An error occurred while generating the PDF.");
        }
    };
    console.log("Order Data Structure:", orderData); // Log the orderData prop to see its structure at runtime


    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Printer className="w-4 h-4" /> PDF
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Export Order to PDF</DialogTitle>
                        <DialogDescription>
                            Generate a PDF document for order #{orderData.orderNumber}.
                        </DialogDescription>
                    </DialogHeader>
                    {pdfGenerationError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{pdfGenerationError}</AlertDescription>
                        </Alert>
                    )}
                    <DialogFooter>
                        <Button type="button" onClick={() => setIsDialogOpen(false)} variant="ghost">
                            Cancel
                        </Button>
                        <Button type="button" onClick={generatePdf}>
                            Generate PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
export { OrderDetailsPdfExportButton }; 
