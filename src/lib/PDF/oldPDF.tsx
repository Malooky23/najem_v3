// // // components/GoodsReceivedPdfButton.tsx
// // 'use client';

// // import React, { useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
// // import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
// // import { GoodsReceivedDocument } from './GoodsReceivedDocument'; // Adjust path as needed

// // import { Button } from "@/components/ui/button"; // Shadcn Button
// // import {
// //     Dialog,
// //     DialogContent,
// //     DialogDescription,
// //     DialogFooter,
// //     DialogHeader,
// //     DialogTitle,
// //     DialogTrigger,
// //     DialogClose, // Import DialogClose for the close button
// // } from "@/components/ui/dialog"; // Shadcn Dialog
// // import { EnrichedOrderSchemaType } from '@/types/orders';

// // // Interfaces (same as before)
// // interface OrderItem {
// //     itemName: string;
// //     quantity: number;
// // }

// // interface OrderData {
// //     orderNumber: number;
// //     customerName: string;
// //     createdAt: string;
// //     items: OrderItem[];
// // }

// // interface GoodsReceivedPdfButtonProps {
// //     orderData: EnrichedOrderSchemaType;
// //     imageStaticData: {
// //         formDate: string;
// //         receiveDate: string;
// //         customerRef?: string;
// //         orderNoIntRef: string;
// //         receiverName: string;
// //         receiverMobile: string;
// //         receiverEid: string;
// //     }
// //     buttonText?: string;
// //     fileName?: string;
// //     children?: ReactNode
// // }

// // export const GoodsReceivedPdfButton: React.FC<GoodsReceivedPdfButtonProps> = ({
// //     orderData,
// //     imageStaticData,
// //     buttonText = "View Goods Received Form",
// //     fileName: initialFileName, // Renamed to avoid conflict
// //     children
// // }) => {
// //     const [ isClient, setIsClient ] = useState(false);
// //     const [ pdfBlobUrl, setPdfBlobUrl ] = useState<string | null>(null);
// //     const [ isDialogOpen, setIsDialogOpen ] = useState(false);
// //     const [ isLoadingPdf, setIsLoadingPdf ] = useState(false); // For loading state

// //     const fileName = initialFileName || `GoodsReceived_${orderData.orderNumber}.pdf`;

// //     useEffect(() => {
// //         setIsClient(true);
// //     }, []);

// //     const MyDocument = useMemo(() => (
// //         <GoodsReceivedDocument data={orderData} imageStaticData={imageStaticData} />
// //     ), [ orderData, imageStaticData ]);

// //     // useCallback for the PDF generation logic
// //     const generateAndSetPdfBlob = useCallback(async () => {
// //         if (!isClient || !MyDocument) return;

// //         setIsLoadingPdf(true);
// //         // Revoke existing blob URL if any, to prevent memory leaks
// //         if (pdfBlobUrl) {
// //             URL.revokeObjectURL(pdfBlobUrl);
// //             setPdfBlobUrl(null); // Explicitly set to null before regenerating
// //         }

// //         try {
// //             console.log("trying :( )")
// //             const blob = await pdf(MyDocument).toBlob();
// //             const url = URL.createObjectURL(blob);
// //             setPdfBlobUrl(url);
// //         } catch (error) {
// //             console.error("Error generating PDF blob:", error);
// //             setPdfBlobUrl(null); // Ensure it's null on error
// //         } finally {
// //             setIsLoadingPdf(false);
// //         }
// //     }, [ isClient, MyDocument, pdfBlobUrl ]); // pdfBlobUrl is in dependency to revoke it

// //     useEffect(() => {
// //         if (isDialogOpen && isClient) {
// //             // When dialog opens, always try to generate/regenerate the PDF
// //             generateAndSetPdfBlob();
// //         }

// //         // Cleanup function for when the component unmounts or dialog closes
// //         return () => {
// //             if (pdfBlobUrl && !isDialogOpen) { // More specific: cleanup when dialog closes
// //                 URL.revokeObjectURL(pdfBlobUrl);
// //                 setPdfBlobUrl(null); // Clear the state
// //             }
// //         };
// //         // eslint-disable-next-line react-hooks/exhaustive-deps
// //     }, [ isDialogOpen, isClient, generateAndSetPdfBlob ]); // generateAndSetPdfBlob is now stable due to useCallback

// //     const handleOpenInNewTab = () => {
// //         if (pdfBlobUrl) {
// //             window.open(pdfBlobUrl, '_blank');
// //         } else if (isClient && !isLoadingPdf) { // Check isLoadingPdf to avoid race condition
// //             // Fallback if blobUrl isn't ready (e.g., user clicks too fast)
// //             // This will use the current MyDocument instance
// //             setIsLoadingPdf(true);
// //             pdf(MyDocument).toBlob().then(blob => {
// //                 const url = URL.createObjectURL(blob);
// //                 window.open(url, '_blank');
// //                 // This ad-hoc URL won't be managed by the component's state for revocation,
// //                 // but it's a short-lived user action.
// //             }).finally(() => setIsLoadingPdf(false));
// //         }
// //     };

// //     if (!isClient) {
// //         return <Button disabled>{buttonText}</Button>;
// //     }

// //     return (
// //         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal>
// //             <DialogTrigger asChild>
// //                 {children ? children :
// //                     <Button variant="outline">{buttonText}</Button>
// //                 }
// //             </DialogTrigger>
// //             <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col"> {/* Adjusted width and height */}
// //                 <DialogHeader>
// //                     <DialogTitle>Goods Received Form Preview</DialogTitle>
// //                     <DialogDescription>
// //                         Review the goods received form. You can download it or open it in a new tab.
// //                     </DialogDescription>
// //                 </DialogHeader>

// //                 <div className="flex-grow min-h-0 h-full  rounded-md border p-1 my-4"> {/* Added padding (p-1) and margin (my-4) */}
// //                     {isLoadingPdf && (
// //                         <div className="flex items-center justify-center h-full">
// //                             <p>Loading PDF preview...</p>
// //                         </div>
// //                     )}
// //                     {!isLoadingPdf && pdfBlobUrl && (
// //                         <iframe
// //                             src={pdfBlobUrl}
// //                             className="w-full h-[calc(100vh*0.65)]"
// //                             title="PDF Preview"
// //                         />
// //                     )}
// //                     {!isLoadingPdf && !pdfBlobUrl && ( // Handles case where generation failed or not started
// //                         <div className="flex items-center justify-center h-full">
// //                             <p>Could not load PDF preview. Please try again.</p>
// //                         </div>
// //                     )}
// //                 </div>

// //                 <DialogFooter className="gap-2 sm:justify-end"> {/* Tailwind gap for spacing */}
// //                     <DialogClose asChild>
// //                         <Button type="button" variant="secondary">
// //                             Close
// //                         </Button>
// //                     </DialogClose>
// //                     <Button onClick={handleOpenInNewTab} disabled={!pdfBlobUrl} variant="outline">
// //                         Open in New Tab
// //                     </Button>
// //                     <PDFDownloadLink document={MyDocument} fileName={fileName}>
// //                         {({ loading }) => (
// //                             <Button disabled={loading || !pdfBlobUrl}>
// //                                 {loading ? 'Generating...' : 'Download PDF'}
// //                             </Button>
// //                         )}
// //                     </PDFDownloadLink>
// //                 </DialogFooter>
// //             </DialogContent>
// //         </Dialog>
// //     );
// // };

// // export default GoodsReceivedPdfButton;

// // src/lib/PDF/GoodsReceivedPdfButton.tsx
// 'use client';

// import React, { useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
// import { PDFDownloadLink, pdf, Font } from '@react-pdf/renderer'; // Added Font
// import { GoodsReceivedDocument } from './GoodsReceivedDocument';

// import { Button } from "@/components/ui/button";
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
//     DialogClose,
// } from "@/components/ui/dialog";
// import { EnrichedOrderSchemaType } from '@/types/orders';

// // It's good practice to register fonts if you are using specific ones,
// // even 'Helvetica' if you want to be absolutely sure.
// // For simplicity, we'll assume default fonts work, but if issues persist,
// // explicitly register Helvetica.
// // Example:
// // Font.register({
// //   family: 'Helvetica',
// //   fonts: [
// //     { src: 'path/to/Helvetica.ttf' }, // replace with actual path or URL
// //     { src: 'path/to/Helvetica-Bold.ttf', fontWeight: 'bold' },
// //   ]
// // });


// interface GoodsReceivedPdfButtonProps {
//     orderData: EnrichedOrderSchemaType;
//     imageStaticData: {
//         formDate: string;
//         receiveDate: string;
//         customerRef?: string;
//         orderNoIntRef: string;
//         receiverName: string;
//         receiverMobile: string;
//         receiverEid: string;
//     }
//     buttonText?: string;
//     fileName?: string;
//     children?: ReactNode;
// }

// export const GoodsReceivedPdfButton: React.FC<GoodsReceivedPdfButtonProps> = ({
//     orderData,
//     imageStaticData,
//     buttonText = "View Goods Received Form",
//     fileName: initialFileName,
//     children
// }) => {
//     const [ isClient, setIsClient ] = useState(false);
//     const [ pdfBlobUrl, setPdfBlobUrl ] = useState<string | null>(null);
//     const [ isDialogOpen, setIsDialogOpen ] = useState(false);
//     const [ isLoadingPdf, setIsLoadingPdf ] = useState(false);
//     const [ pdfError, setPdfError ] = useState<string | null>(null); // To display PDF generation errors

//     const fileName = initialFileName || `GoodsReceived_${orderData.orderNumber}.pdf`;

//     useEffect(() => {
//         setIsClient(true);
//     }, []);

//     const MyDocument = useMemo(() => (
//         // Ensure data passed to GoodsReceivedDocument is not undefined/null in critical places
//         <GoodsReceivedDocument data={orderData} imageStaticData={imageStaticData} />
//     ), [ orderData, imageStaticData ]);

//     const generateAndSetPdfBlob = useCallback(async () => {
//         if (!isClient || !MyDocument) return;

//         setIsLoadingPdf(true);
//         setPdfError(null); // Clear previous errors

//         // Revoke existing blob URL if any
//         if (pdfBlobUrl) {
//             URL.revokeObjectURL(pdfBlobUrl);
//         }
//         // Set to null before regenerating to ensure UI updates correctly
//         setPdfBlobUrl(null);


//         try {
//             console.log("Trying to generate PDF..."); // More specific log
//             const blob = await pdf(MyDocument).toBlob();
//             const url = URL.createObjectURL(blob);
//             setPdfBlobUrl(url);
//             console.log("PDF generated successfully, URL:", url);
//         } catch (error: any) {
//             console.error("Error generating PDF blob in GoodsReceivedPdfButton:", error);
//             setPdfError(error.message || "An unknown error occurred during PDF generation.");
//             setPdfBlobUrl(null);
//         } finally {
//             setIsLoadingPdf(false);
//         }
//         // Removed pdfBlobUrl from dependencies here.
//         // The revocation is handled, and setting it to null before re-gen is key.
//         // Re-adding it caused the loop previously because setPdfBlobUrl changed it.
//     }, [ isClient, MyDocument ]);

//     useEffect(() => {
//         let didCancel = false;

//         if (isDialogOpen && isClient) {
//             // When dialog opens, always try to generate/regenerate the PDF
//             // Make sure this effect doesn't run if it's already generating
//             if (!isLoadingPdf ) { // Only generate if not loading and no URL exists
//                 generateAndSetPdfBlob();
//             } else if (!isLoadingPdf && pdfBlobUrl && !isDialogOpen) {
//                 // If dialog was closed and reopened, and URL exists,
//                 // we might want to ensure it's still valid or regenerate.
//                 // For now, let's stick to generating if no URL.
//             }
//         }

//         return () => {
//             didCancel = true;
//             // Cleanup when dialog closes or component unmounts
//             if (pdfBlobUrl) { // Check if pdfBlobUrl was set before revoking
//                 // URL.revokeObjectURL(pdfBlobUrl);
//                 // console.log("Revoked PDF Blob URL on cleanup:", pdfBlobUrl);
//                 // No need to setPdfBlobUrl(null) here if generateAndSetPdfBlob does it.
//             }
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [ isDialogOpen ]); // Added isLoadingPdf to deps

//     // Effect to re-generate if dialog opens and there's no URL (e.g., after a previous error)
//     useEffect(() => {
//         if (isDialogOpen && isClient && !pdfBlobUrl && !isLoadingPdf) {
//             generateAndSetPdfBlob();
//         }
//     }, [ isDialogOpen, isClient, pdfBlobUrl, isLoadingPdf, generateAndSetPdfBlob ]);


//     const handleOpenInNewTab = () => {
//         // ... (handleOpenInNewTab implementation remains the same)
//         if (pdfBlobUrl) {
//             window.open(pdfBlobUrl, '_blank');
//         } else if (isClient && !isLoadingPdf) {
//             setIsLoadingPdf(true);
//             setPdfError(null);
//             pdf(MyDocument).toBlob().then(blob => {
//                 const url = URL.createObjectURL(blob);
//                 window.open(url, '_blank');
//             }).catch((error: any) => {
//                 console.error("Error generating PDF for new tab:", error);
//                 setPdfError(error.message || "Failed to generate PDF for new tab.");
//             }).finally(() => setIsLoadingPdf(false));
//         }
//     };


//     if (!isClient) {
//         return children ? <>{children}</> : <Button disabled>{buttonText}</Button>;
//     }

//     return (
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogTrigger asChild>
//                 {children ? children :
//                     <Button variant="outline" onClick={() => {
//                         setPdfBlobUrl(null); // Explicitly clear URL on trigger click
//                         setPdfError(null);
//                         // setIsDialogOpen(true); // onOpenChange will handle this
//                     }}>{buttonText}</Button>
//                 }
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col">
//                 <DialogHeader>
//                     <DialogTitle>Goods Received Form Preview {pdfBlobUrl}</DialogTitle>
//                     <DialogDescription>
//                         Review the goods received form. You can download it or open it in a new tab.
//                     </DialogDescription>
//                 </DialogHeader>

//                 <div className="flex-grow min-h-0 h-full rounded-md border p-1 my-4">
//                     {isLoadingPdf && (
//                         <div className="flex items-center justify-center h-full">
//                             <p>Loading PDF preview...</p>
//                         </div>
//                     )}
//                     {!isLoadingPdf && pdfBlobUrl && (

//                         <iframe
//                             src={pdfBlobUrl}
//                             className="w-full h-full" // Adjusted height slightly
//                             title="PDF Preview"
//                         />
//                     )}
//                     {!isLoadingPdf && !pdfBlobUrl && (
//                         <div className="flex flex-col items-center justify-center h-full text-center">
//                             <p className="mb-2">
//                                 {pdfError ? "Failed to load PDF preview." : "PDF preview will appear here."}
//                             </p>
//                             {pdfError && <p className="text-red-500 text-sm">{pdfError}</p>}
//                             {!pdfError && !isLoadingPdf && isDialogOpen && (
//                                 <Button onClick={generateAndSetPdfBlob} variant="outline" className="mt-4">
//                                     Retry Generating PDF
//                                 </Button>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 <DialogFooter className="gap-2 sm:justify-end">
//                     <DialogClose asChild>
//                         <Button type="button" variant="secondary">
//                             Close
//                         </Button>
//                     </DialogClose>
//                     <Button onClick={handleOpenInNewTab} disabled={!pdfBlobUrl || isLoadingPdf} variant="outline">
//                         Open in New Tab
//                     </Button>
//                     <PDFDownloadLink document={MyDocument} fileName={fileName}>
//                         {({ loading: downloadLinkLoading }) => (
//                             <Button disabled={downloadLinkLoading || !pdfBlobUrl || isLoadingPdf}>
//                                 {downloadLinkLoading ? 'Preparing...' : 'Download PDF'}
//                             </Button>
//                         )}
//                     </PDFDownloadLink>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     );
// };

// export default GoodsReceivedPdfButton;

// src/lib/PDF/GoodsReceivedPdfButton.tsx
