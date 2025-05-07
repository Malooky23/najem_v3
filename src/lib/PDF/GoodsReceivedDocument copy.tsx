// // // components/GoodsReceivedDocument.tsx
// // import React from 'react';
// // import { EnrichedOrderSchemaType } from '@/types/orders';
// // import { format } from 'date-fns';
// // import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// // // Interfaces (OrderData, OrderItem) and formatDate function remain the same as your previous version.
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

// // interface GoodsReceivedDocumentProps {
// //     data: EnrichedOrderSchemaType;
// //     imageStaticData: {
// //         formDate: string;
// //         receiveDate: string;
// //         customerRef?: string;
// //         orderNoIntRef: string;
// //         receiverName: string;
// //         receiverMobile: string;
// //         receiverEid: string;
// //     }
// // }

// // const formatDate = (dateString: string): string => {
// //     if (!dateString) return '';
// //     const date = new Date(dateString);
// //     const day = String(date.getDate()).padStart(2, '0');
// //     const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
// //     const year = date.getFullYear();
// //     return `${day}-${month}-${year}`;
// // };

// // const styles = StyleSheet.create({
// //     page: {
// //         fontSize: 9,
// //         paddingBottom: 25,
// //         paddingHorizontal: 30,
// //         color: 'black',
// //     },
// //     header: {
// //         border: '1px solid black bottom',
// //         textAlign: 'center',
// //         marginBottom: 8

// //     },
// //     headerText: {
// //         fontSize: 14,
// //         fontWeight: 'bold',
// //         // marginBottom: 4
// //     },
// //     topSection: {
// //         flexDirection: 'row',
// //         justifyContent: 'space-between',
// //         marginBottom: 8,
// //     },
// //     topLeft: {
// //         width: '65%',
// //     },
// //     topRight: {
// //         width: '33%',
// //     },
// //     infoBox: {
// //         border: '1px solid black',
// //     },
// //     infoBoxTitle: {
// //         backgroundColor: '#E0E0E0',
// //         padding: 4, 
// //         fontWeight: 'bold',
// //         textAlign: 'center',
// //         borderBottom: '1px solid black',
// //     },
// //     infoRow: {
// //         flexDirection: 'row',
// //         borderBottom: '1px solid black',
// //     },
// //     infoRowLastNoBorder: { 
// //         flexDirection: 'row',
// //     },
// //     infoLabel: {
// //         width: '35%',
// //         padding: 4, 
// //         borderRight: '1px solid black',
// //         fontWeight: 'bold',
// //     },
// //     infoValue: {
// //         width: '65%',
// //         padding: 4, 
// //     },
// //     itemsTable: {
// //         border: '1px solid black',
// //         marginTop: 8,
// //         marginBottom: 8,
// //     },
// //     tableHeader: {
// //         flexDirection: 'row',
// //         backgroundColor: '#E0E0E0',
// //         borderBottom: '1px solid black',
// //         fontWeight: 'bold',
// //     },
// //     tableRow: {
// //         flexDirection: 'row',
// //         borderBottom: '1px solid black',
// //     },
// //     th: {
// //         padding: 4,
// //         textAlign: 'center',
// //         borderRight: '1px solid black',
// //     },
// //     td: {
// //         padding: 4,
// //         borderRight: '1px solid black',
// //     },
// //     colIndex: { width: '8%', textAlign: 'center' },
// //     colDesc: { width: '52%' },
// //     colType: { width: '20%', textAlign: 'center' },
// //     colQty: { width: '20%', textAlign: 'center' },
// //     totalRow: {
// //         flexDirection: 'row',
// //         fontWeight: 'bold',
// //         borderTop: '1px solid black',
// //     },
// //     totalLabelCell: {
// //         width: '80%',
// //         padding: 4,
// //         textAlign: 'right',
// //         borderRight: '1px solid black',
// //     },
// //     totalValueCell: {
// //         width: '20%',
// //         padding: 4,
// //         textAlign: 'center',
// //     },
// //     confirmationSection: {
// //         border: '1px solid black',
// //         padding: 7,
// //         marginTop: 8,
// //         marginBottom: 8,
// //     },
// //     confirmationTitle: {
// //         fontWeight: 'bold',
// //         textAlign: 'center',
// //         paddingBottom: 4,
// //         borderBottom: '1px solid black',
// //         marginBottom: 4,
// //     },
// //     confirmationText: {
// //         marginBottom: 3,
// //     },
// //     confirmationPoint: {
// //         flexDirection: 'row',
// //         marginBottom: 3,
// //     },
// //     confirmationNumber: {
// //         width: '5%',
// //         fontWeight: 'bold',
// //     },
// //     confirmationPointText: {
// //         width: '95%',
// //     },
// //     boldText: {
// //         fontWeight: 'bold',
// //     },
// //     receiverDetailsSection: {
// //         border: '1px solid black',
// //         marginTop: 8,
// //     },
// //     signatureBox: {
// //         height: 35,
// //         padding: 4,
// //     }
// // });


// // export const GoodsReceivedDocument: React.FC<GoodsReceivedDocumentProps> = ({ data, imageStaticData }) => {
// //     const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);

// //     return (
// //         <Document title={`Goods Received - ${data.orderNumber}`}>
// //             <Page size="A4" style={styles.page}>
// //                 <View style={styles.header}>
// //                     <Text style={styles.headerText}>GOODS RECEIVED FORM</Text>
// //                 </View>
// //                 <View style={styles.topSection}>
// //                     <View style={styles.topLeft}>
// //                         <View style={styles.infoBox}>
// //                             <Text style={styles.infoBoxTitle}>Customer Information</Text>
// //                             <View style={styles.infoRow}>
// //                                 <Text style={styles.infoLabel}>Company Name</Text>
// //                                 <Text style={styles.infoValue}>{data.customerName}</Text>
// //                             </View>
// //                             <View style={styles.infoRowLastNoBorder}>
// //                                 <Text style={styles.infoLabel}>Receiver Name</Text>
// //                                 <Text style={styles.infoValue}>{imageStaticData.receiverName}</Text>
// //                             </View>
// //                         </View>
// //                     </View>
// //                     <View style={styles.topRight}>
// //                         <View style={[ styles.infoBox, { marginBottom: 5 } ]}>
// //                             <View style={styles.infoRowLastNoBorder}>
// //                                 <Text style={[ styles.infoLabel, { width: '40%' } ]}>Date</Text>
// //                                 <Text style={[ styles.infoValue, { width: '60%' } ]}>{imageStaticData.formDate}</Text>
// //                             </View>
// //                         </View>
// //                         <View style={styles.infoBox}>
// //                             <Text style={styles.infoBoxTitle}>Shipment Details</Text>
// //                             <View style={styles.infoRow}>
// //                                 <Text style={styles.infoLabel}>Receive Date</Text>
// //                                 <Text style={styles.infoValue}>{format(data.createdAt, 'dd-MM-yyyy') || imageStaticData.receiveDate}</Text>
// //                             </View>
// //                             <View style={styles.infoRow}>
// //                                 <Text style={styles.infoLabel}>Customer Ref.</Text>
// //                                 <Text style={styles.infoValue}>{imageStaticData.customerRef || '-'}</Text>
// //                             </View>
// //                             <View style={styles.infoRowLastNoBorder}>
// //                                 <Text style={styles.infoLabel}>Order No. (Int. Ref.)</Text>
// //                                 <Text style={styles.infoValue}>{String(data.orderNumber) || imageStaticData.orderNoIntRef}</Text>
// //                             </View>
// //                         </View>
// //                     </View>
// //                 </View>
// //                 <View style={styles.itemsTable}>
// //                     <View style={styles.tableHeader}>
// //                         <Text style={[ styles.th, styles.colIndex ]}>#</Text>
// //                         <Text style={[ styles.th, styles.colDesc ]}>Description of Goods</Text>
// //                         <Text style={[ styles.th, styles.colType ]}>Item Type</Text>
// //                         <Text style={[ styles.th, styles.colQty, { borderRightWidth: 0 } ]}>Quantity</Text>
// //                     </View>
// //                     {data.items.map((item, index) => (
// //                         <View key={`item-${index}`} style={styles.tableRow}>
// //                             <Text style={[ styles.td, styles.colIndex ]}>{index + 1}</Text>
// //                             <Text style={[ styles.td, styles.colDesc ]}>{item.itemName}</Text>
// //                             <Text style={[ styles.td, styles.colType ]}>{item.itemType}</Text> {/* Item Type - empty */}
// //                             <Text style={[ styles.td, styles.colQty, { borderRightWidth: 0 } ]}>{item.quantity}</Text>
// //                         </View>
// //                     ))}
// //                     <View style={styles.totalRow}>
// //                         <Text style={styles.totalLabelCell}>Total</Text>
// //                         <Text style={[ styles.totalValueCell, { borderRightWidth: 0 } ]}>{totalQuantity}</Text>
// //                     </View>
// //                 </View>
// //                 <View style={styles.confirmationSection} wrap={false}>
// //                     <Text style={styles.confirmationTitle}>Receiver Confirmation</Text>
// //                     <Text style={styles.confirmationText}>
// //                         I, the undersigned, confirm that I have thoroughly inspected and verified the goods listed above upon receipt. I acknowledge that:
// //                     </Text>
// //                     <View style={styles.confirmationPoint}>
// //                         <Text style={styles.confirmationNumber}>1.</Text>
// //                         <Text style={styles.confirmationPointText}>
// //                             <Text style={styles.boldText}>All goods have been received in full and in satisfactory condition</Text>
// //                             <Text>, as per the details provided above.</Text>
// //                         </Text>
// //                     </View>
// //                     <View style={styles.confirmationPoint}>
// //                         <Text style={styles.confirmationNumber}>2.</Text>
// //                         <Text style={styles.confirmationPointText}>
// //                             <Text style={styles.boldText}>I accept full responsibility for the goods from the point of receipt</Text>
// //                             <Text>, and I understand that Najem Aleen Shipping LLC will not be held liable for any damages, defects, shortages, or issues discovered after the goods have been signed for and received.</Text></Text>
// //                     </View>
// //                     <View style={styles.confirmationPoint}>
// //                         <Text style={styles.confirmationNumber}>3.</Text>
// //                         <Text style={styles.confirmationPointText}>Najem Aleen Shipping LLC disclaims any further responsibility for the goods once they have been handed over to the customer or the customer's agent. Any loss, damage, or deterioration occurring after this point is solely the responsibility of the customer.</Text>
// //                     </View>
// //                 </View>
// //                 <View style={styles.receiverDetailsSection} wrap={false}>
// //                     <Text style={styles.infoBoxTitle}>Receiver Details</Text>
// //                     <View style={styles.infoRow}>
// //                         <Text style={styles.infoLabel}>Receivers/Agent Name</Text>
// //                         <Text style={styles.infoValue}>{imageStaticData.receiverName}</Text>
// //                     </View>
// //                     <View style={styles.infoRow}>
// //                         <Text style={styles.infoLabel}>Mobile No.</Text>
// //                         <Text style={styles.infoValue}>{imageStaticData.receiverMobile}</Text>
// //                     </View>
// //                     <View style={styles.infoRow}>
// //                         <Text style={styles.infoLabel}>EID Number</Text>
// //                         <Text style={styles.infoValue}>{imageStaticData.receiverEid}</Text>
// //                     </View>
// //                     <View style={styles.infoRow}>
// //                         <Text style={styles.infoLabel}>Date</Text>
// //                         <Text style={styles.infoValue}></Text>
// //                     </View>
// //                     <View style={styles.infoRowLastNoBorder}>
// //                         <Text style={styles.infoLabel}>Signature</Text>
// //                         <View style={[ styles.infoValue, styles.signatureBox ]}></View>
// //                     </View>
// //                 </View>
// //             </Page>
// //         </Document>
// //     );
// // };


// // src/lib/PDF/GoodsReceivedDocument.tsx
// import React from 'react';
// import { EnrichedOrderSchemaType } from '@/types/orders';
// import { format } from 'date-fns';
// import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// // Register a font if you have a specific one, otherwise Helvetica is default
// // Font.register({
// //   family: 'YourCustomFont',
// //   fonts: [
// //     { src: '/path/to/font.ttf' },
// //     { src: '/path/to/font-bold.ttf', fontWeight: 'bold' },
// //   ],
// // });

// interface OrderItem {
//     itemName: string;
//     quantity: number;
//     itemType?: string; // Added as it's used in the table
// }

// // Interface EnrichedOrderSchemaType is expected to be defined in '@/types/orders'
// // and should include at least:
// // orderNumber: number | string;
// // customerName: string;
// // createdAt: string | Date; // Should be a parsable date string or Date object for date-fns
// // items: OrderItem[];

// interface GoodsReceivedDocumentProps {
//     data: EnrichedOrderSchemaType;
//     imageStaticData: {
//         formDate: string; // Assumed to be pre-formatted
//         receiveDate: string; // Assumed to be pre-formatted, used as fallback
//         customerRef?: string;
//         orderNoIntRef: string;
//         receiverName: string;
//         receiverMobile: string;
//         receiverEid: string;
//     };
//     companyName?: string; // Optional: for header
//     companyLogo?: string; // Optional: URL or path to logo
// }

// const styles = StyleSheet.create({
//     page: {
//         fontSize: 10,
//         paddingTop: 30,
//         paddingBottom: 50, // Increased padding for footer/page number
//         paddingHorizontal: 35,
//         color: '#333333',
//         fontFamily: 'Helvetica', // Explicitly set, though default
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'flex-start',
//         marginBottom: 15,
//         paddingBottom: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#EAEAEA',
//     },
//     companyDetails: {
//         maxWidth: '60%',
//     },
//     companyName: {
//         fontSize: 14,
//         fontWeight: 'bold',
//         color: '#222222',
//         marginBottom: 2,
//     },
//     // companyLogo: { width: 100, height: 40, marginBottom: 5 }, // Example style for logo
//     documentTitleContainer: {
//         textAlign: 'right',
//     },
//     documentTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#222222',
//     },
//     documentSubtitle: {
//         fontSize: 9,
//         color: '#555555',
//     },
//     topSection: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 15,
//     },
//     topLeft: {
//         width: '60%', // Adjusted width
//         paddingRight: 10,
//     },
//     topRight: {
//         width: '40%', // Adjusted width
//     },
//     infoBox: {
//         borderWidth: 1,
//         borderColor: '#CCCCCC',
//         borderRadius: 3,
//         marginBottom: 10,
//     },
//     infoBoxTitle: {
//         backgroundColor: '#F5F5F5',
//         padding: 6,
//         fontSize: 11,
//         fontWeight: 'bold',
//         borderBottomWidth: 1,
//         borderBottomColor: '#CCCCCC',
//         color: '#333333',
//     },
//     infoRow: {
//         flexDirection: 'row',
//         borderBottomWidth: 1,
//         borderBottomColor: '#EEEEEE',
//     },
//     infoRowLast: { // No bottom border for the last row in a box
//         flexDirection: 'row',
//     },
//     infoLabel: {
//         width: '38%', // Adjusted for consistent look
//         padding: 6,
//         fontWeight: 'bold',
//         fontSize: 9,
//         color: '#555555',
//         borderRightWidth: 1,
//         borderRightColor: '#EEEEEE',
//     },
//     infoValue: {
//         width: '62%', // Adjusted for consistent look
//         padding: 6,
//         fontSize: 9,
//         color: '#333333',
//     },
//     itemsTable: {
//         borderWidth: 1,
//         borderColor: '#CCCCCC',
//         borderRadius: 3,
//         marginTop: 10,
//         marginBottom: 15,
//     },
//     tableHeader: {
//         flexDirection: 'row',
//         backgroundColor: '#F5F5F5',
//         borderBottomWidth: 1,
//         borderBottomColor: '#CCCCCC',
//         fontWeight: 'bold',
//         fontSize: 10,
//     },
//     tableRow: {
//         flexDirection: 'row',
//         borderBottomWidth: 1,
//         borderBottomColor: '#EEEEEE',
//     },
//     tableRowLast: { // No bottom border for the last item row
//         flexDirection: 'row',
//     },
//     th: {
//         paddingVertical: 6,
//         paddingHorizontal: 5,
//         textAlign: 'center',
//         borderRightWidth: 1,
//         borderRightColor: '#DDDDDD',
//         color: '#333333',
//     },
//     thNoBorder: {
//         borderRightWidth: 0,
//     },
//     td: {
//         paddingVertical: 6,
//         paddingHorizontal: 5,
//         fontSize: 9,
//         borderRightWidth: 1,
//         borderRightColor: '#EEEEEE',
//     },
//     tdNoBorder: {
//         borderRightWidth: 0,
//     },
//     colIndex: { width: '10%', textAlign: 'center' },
//     colDesc: { width: '50%' },
//     colType: { width: '20%', textAlign: 'center' },
//     colQty: { width: '20%', textAlign: 'center' },
//     totalRow: {
//         flexDirection: 'row',
//         fontWeight: 'bold',
//         borderTopWidth: 1,
//         borderTopColor: '#CCCCCC',
//         backgroundColor: '#FAFAFA',
//     },
//     totalLabelCell: {
//         width: '80%', // Sum of index, desc, type
//         padding: 6,
//         textAlign: 'right',
//         fontSize: 10,
//         borderRightWidth: 1,
//         borderRightColor: '#CCCCCC',
//     },
//     totalValueCell: {
//         width: '20%', // Qty column
//         padding: 6,
//         textAlign: 'center',
//         fontSize: 10,
//     },
//     confirmationSection: {
//         borderWidth: 1,
//         borderColor: '#DDDDDD',
//         padding: 10,
//         marginTop: 10,
//         marginBottom: 15,
//         borderRadius: 3,
//     },
//     confirmationTitle: {
//         fontWeight: 'bold',
//         fontSize: 10, // Smaller title for T&C
//         textAlign: 'center',
//         paddingBottom: 5,
//         borderBottomWidth: 1,
//         borderBottomColor: '#EEEEEE',
//         marginBottom: 8,
//         color: '#444444',
//     },
//     confirmationText: {
//         fontSize: 7.5, // Smaller font for T&C
//         marginBottom: 6,
//         lineHeight: 1.3,
//         color: '#666666',
//         textAlign: 'justify',
//     },
//     confirmationPoint: {
//         flexDirection: 'row',
//         marginBottom: 4,
//     },
//     confirmationNumber: {
//         width: '4%',
//         fontSize: 7.5, // Smaller font for T&C
//         fontWeight: 'bold',
//         color: '#555555',
//         lineHeight: 1.3,
//     },
//     confirmationPointText: {
//         width: '96%',
//         fontSize: 7.5, // Smaller font for T&C
//         color: '#666666',
//         lineHeight: 1.3,
//         textAlign: 'justify',
//     },
//     boldTextTnC: { // Specific bold style for T&C to control color if needed
//         fontWeight: 'bold',
//         color: '#555555', // Slightly more prominent than regular T&C text
//     },
//     receiverDetailsSection: { // Reuses infoBox styling mostly
//         borderWidth: 1,
//         borderColor: '#CCCCCC',
//         borderRadius: 3,
//         marginTop: 10,
//     },
//     signatureBox: {
//         height: 40, // Ample space for signature
//         // The infoValue style provides padding
//     },
//     pageNumber: {
//         position: 'absolute',
//         fontSize: 8,
//         bottom: 25,
//         left: 0,
//         right: 0,
//         textAlign: 'center',
//         color: '#AAAAAA',
//     },
// });


// export const GoodsReceivedDocument: React.FC<GoodsReceivedDocumentProps> = ({ data, imageStaticData, companyName = "Your Company Name" }) => {
//     const totalQuantity = data.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

//     return (
//         <Document title={`Goods Received - ${data.orderNumber}`}>
//             <Page size="A4" style={styles.page}>
//                 <View style={styles.header} fixed>
//                     <View style={styles.companyDetails}>
//                         {/* Example for logo: <Image src={companyLogo} style={styles.companyLogo} /> */}
//                         <Text style={styles.companyName}>{companyName}</Text>
//                         {/* Add more company details if needed, e.g., address, contact */}
//                     </View>
//                     <View style={styles.documentTitleContainer}>
//                         <Text style={styles.documentTitle}>GOODS RECEIVED NOTE</Text>
//                         <Text style={styles.documentSubtitle}>Order No: {String(data.orderNumber) || imageStaticData.orderNoIntRef}</Text>
//                     </View>
//                 </View>

//                 <View style={styles.topSection}>
//                     <View style={styles.topLeft}>
//                         <View style={styles.infoBox}>
//                             <Text style={styles.infoBoxTitle}>Customer Information</Text>
//                             <View style={styles.infoRow}>
//                                 <Text style={styles.infoLabel}>Company Name</Text>
//                                 <Text style={styles.infoValue}>{data.customerName}</Text>
//                             </View>
//                             <View style={styles.infoRowLast}>
//                                 <Text style={styles.infoLabel}>Receiver Name</Text>
//                                 <Text style={styles.infoValue}>{imageStaticData.receiverName}</Text>
//                             </View>
//                         </View>
//                     </View>
//                     <View style={styles.topRight}>
//                         <View style={styles.infoBox}>
//                             <View style={styles.infoRow}>
//                                 <Text style={[ styles.infoLabel, { width: '40%' } ]}>Form Date</Text>
//                                 <Text style={[ styles.infoValue, { width: '60%' } ]}>{imageStaticData.formDate}</Text>
//                             </View>
//                             <View style={styles.infoRow}>
//                                 <Text style={styles.infoLabel}>Receive Date</Text>
//                                 <Text style={styles.infoValue}>{data.createdAt ? format(new Date(data.createdAt), 'dd-MM-yyyy') : imageStaticData.receiveDate}</Text>
//                             </View>
//                             <View style={styles.infoRow}>
//                                 <Text style={styles.infoLabel}>Customer Ref.</Text>
//                                 <Text style={styles.infoValue}>{imageStaticData.customerRef || '-'}</Text>
//                             </View>
//                             <View style={styles.infoRowLast}>
//                                 <Text style={styles.infoLabel}>Order No. (Int)</Text>
//                                 <Text style={styles.infoValue}>{String(data.orderNumber) || imageStaticData.orderNoIntRef}</Text>
//                             </View>
//                         </View>
//                     </View>
//                 </View>

//                 <View style={styles.itemsTable}>
//                     <View style={styles.tableHeader}>
//                         <Text style={[ styles.th, styles.colIndex ]}>#</Text>
//                         <Text style={[ styles.th, styles.colDesc ]}>Description of Goods</Text>
//                         <Text style={[ styles.th, styles.colType ]}>Item Type</Text>
//                         <Text style={[ styles.th, styles.colQty, styles.thNoBorder ]}>Quantity</Text>
//                     </View>
//                     {data.items.map((item, index) => (
//                         <View key={`item-${index}`} style={index === data.items.length - 1 ? styles.tableRowLast : styles.tableRow}>
//                             <Text style={[ styles.td, styles.colIndex ]}>{index + 1}</Text>
//                             <Text style={[ styles.td, styles.colDesc ]}>{item.itemName}</Text>
//                             <Text style={[ styles.td, styles.colType ]}>{item.itemType || '-'}</Text>
//                             <Text style={[ styles.td, styles.colQty, styles.tdNoBorder ]}>{item.quantity}</Text>
//                         </View>
//                     ))}
//                     {data.items.length === 0 && (
//                         <View style={styles.tableRowLast}>
//                             <Text style={[ styles.td, { width: '100%', textAlign: 'center', borderRightWidth: 0 } ]}>No items listed.</Text>
//                         </View>
//                     )}
//                     <View style={styles.totalRow}>
//                         <Text style={styles.totalLabelCell}>Total Quantity</Text>
//                         <Text style={[ styles.totalValueCell, styles.tdNoBorder ]}>{totalQuantity}</Text>
//                     </View>
//                 </View>

//                 <View style={styles.confirmationSection} wrap={false}>
//                     <Text style={styles.confirmationTitle}>Receiver Confirmation</Text>
//                     <Text style={styles.confirmationText}>
//                         I, the undersigned, confirm that I have thoroughly inspected and verified the goods listed above upon receipt. I acknowledge that:
//                     </Text>
//                     <View style={styles.confirmationPoint}>
//                         <Text style={styles.confirmationNumber}>1.</Text>
//                         <Text style={styles.confirmationPointText}>
//                             <Text style={styles.boldTextTnC}>All goods have been received in full and in satisfactory condition</Text>
//                             <Text>, as per the details provided above.</Text>
//                         </Text>
//                     </View>
//                     <View style={styles.confirmationPoint}>
//                         <Text style={styles.confirmationNumber}>2.</Text>
//                         <Text style={styles.confirmationPointText}>
//                             <Text style={styles.boldTextTnC}>I accept full responsibility for the goods from the point of receipt</Text>
//                             <Text>, and I understand that {companyName} will not be held liable for any damages, defects, shortages, or issues discovered after the goods have been signed for and received.</Text>
//                         </Text>
//                     </View>
//                     <View style={styles.confirmationPoint}>
//                         <Text style={styles.confirmationNumber}>3.</Text>
//                         <Text style={styles.confirmationPointText}>
//                             {companyName} disclaims any further responsibility for the goods once they have been handed over to the customer or the customer's agent. Any loss, damage, or deterioration occurring after this point is solely the responsibility of the customer.
//                         </Text>
//                     </View>
//                 </View>

//                 <View style={styles.receiverDetailsSection} wrap={false}>
//                     <Text style={styles.infoBoxTitle}>Receiver Details & Signature</Text>
//                     <View style={styles.infoRow}>
//                         <Text style={styles.infoLabel}>Receiver's/Agent Name</Text>
//                         <Text style={styles.infoValue}>{imageStaticData.receiverName}</Text>
//                     </View>
//                     <View style={styles.infoRow}>
//                         <Text style={styles.infoLabel}>Mobile No.</Text>
//                         <Text style={styles.infoValue}>{imageStaticData.receiverMobile}</Text>
//                     </View>
//                     <View style={styles.infoRow}>
//                         <Text style={styles.infoLabel}>EID Number</Text>
//                         <Text style={styles.infoValue}>{imageStaticData.receiverEid}</Text>
//                     </View>
//                     <View style={styles.infoRow}>
//                         <Text style={styles.infoLabel}>Date Received</Text>
//                         <Text style={styles.infoValue}></Text>{/* Typically filled by hand */}
//                     </View>
//                     <View style={styles.infoRowLast}>
//                         <Text style={styles.infoLabel}>Signature & Stamp</Text>
//                         <View style={[ styles.infoValue, styles.signatureBox ]}></View>
//                     </View>
//                 </View>

//                 <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
//                     `${pageNumber} / ${totalPages}`
//                 )} fixed />
//             </Page>
//         </Document>
//     );
// };

// src/lib/PDF/GoodsReceivedDocument.tsx
import React from 'react';
import { EnrichedOrderSchemaType } from '@/types/orders';
import { format } from 'date-fns';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
// --- FONT DEFINITIONS AND REGISTRATION ---
const ENGLISH_FONT_FAMILY = 'Helvetica'; // Or your registered English font like 'Lato', 'Roboto'
const ARABIC_FONT_FAMILY = 'NotoNaskhArabic'; // This MUST match the family name in Font.register

// IMPORTANT: Register NotoSansArabic (and any custom English font)
// See detailed instructions in the thought block or previous response.
// Example:

//FONT FILES AVAILABLE AT
// RELATIVE PATH: src/lib/PDF/fonts/NotoNaskhArabic-Regular.ttf
// RELATIVE PATH: src/lib/PDF/fonts/NotoNaskhArabic-Bold.ttf

Font.register({
  family: ARABIC_FONT_FAMILY,
  fonts: [
      { src: 'src/lib/PDF/fonts/NotoNaskhArabic-Regular.ttf', fontStyle: 'normal', fontWeight: 'normal' },
      { src: 'src/lib/PDF/fonts/NotoNaskhArabic-Bold.ttf', fontStyle: 'normal', fontWeight: 'bold' },
  ],
});


// --- HELPER FUNCTION AND SMARTTEXT COMPONENT ---

// Helper function to determine if a character is Arabic
const isArabicChar = (char: string): boolean => {
    if (!char) return false;
    const charCode = char.charCodeAt(0);
    return (
        (charCode >= 0x0600 && charCode <= 0x06FF) || // Arabic
        (charCode >= 0x0750 && charCode <= 0x077F) || // Arabic Supplement
        (charCode >= 0x08A0 && charCode <= 0x08FF) || // Arabic Extended-A
        (charCode >= 0xFB50 && charCode <= 0xFDFF) || // Arabic Presentation Forms-A
        (charCode >= 0xFE70 && charCode <= 0xFEFF)    // Arabic Presentation Forms-B
    );
};

interface SmartTextProps {
    children: React.ReactNode; // Can be string, number, or other valid Text children
    style?: any;             // Style object, similar to what <Text> takes
    englishFont?: string;
    arabicFont?: string;
}

const SmartText: React.FC<SmartTextProps> = ({
    children,
    style = {},
    englishFont = ENGLISH_FONT_FAMILY,
    arabicFont = ARABIC_FONT_FAMILY,
}) => {
    const text = children;

    if (typeof text !== 'string' || !text) {
        // For non-strings (e.g. numbers) or empty strings, render with default/English font.
        // The style passed already might contain a fontFamily, ensure it's the English one or default.
        return <Text style={{ ...style, fontFamily: style.fontFamily || englishFont }}>{text}</Text>;
    }

    const segments = [];
    let currentSegment = '';
    let currentLangIsArabic: boolean | null = null;

    for (let i = 0; i < text.length; i++) {
        const char = text[ i ];
        const charIsArabic = isArabicChar(char);

        if (currentSegment === '') {
            currentSegment += char;
            currentLangIsArabic = charIsArabic;
        } else if (charIsArabic === currentLangIsArabic) {
            currentSegment += char;
        } else {
            segments.push({ text: currentSegment, isArabic: currentLangIsArabic as boolean });
            currentSegment = char;
            currentLangIsArabic = charIsArabic;
        }
    }
    if (currentSegment !== '') {
        segments.push({ text: currentSegment, isArabic: currentLangIsArabic as boolean });
    }

    if (segments.length === 0) {
        return <Text style={style}></Text>; // Empty text
    }

    // If only one segment, or all segments are of the same language type,
    // render a single Text component with the appropriate font.
    const allSameLang = segments.every(seg => seg.isArabic === segments[ 0 ].isArabic);
    if (segments.length === 1 || allSameLang) {
        const resolvedFontFamily = segments[ 0 ].isArabic ? arabicFont : englishFont;
        return (
            <Text style={{ ...style, fontFamily: resolvedFontFamily }}>
                {text}
            </Text>
        );
    }

    // For multiple segments with mixed languages, render them as a sequence of <Text> components.
    // The outer <Text> carries the base style. Inner <Text> components override fontFamily.
    return (
        <Text style={style}>
            {segments.map((segment, index) => (
                <Text
                    key={index}
                    style={{ fontFamily: segment.isArabic ? arabicFont : englishFont }}
                >
                    {segment.text}
                </Text>
            ))}
        </Text>
    );
};


// --- INTERFACES (OrderItem, GoodsReceivedDocumentProps) ---
interface OrderItem {
    itemName: string;
    quantity: number;
    itemType?: string;
}

interface GoodsReceivedDocumentProps {
    data: EnrichedOrderSchemaType;
    imageStaticData: {
        formDate: string;
        receiveDate: string;
        customerRef?: string;
        orderNoIntRef: string;
        receiverName: string;
        receiverMobile: string;
        receiverEid: string;
    };
}

// --- STYLES ---
const styles = StyleSheet.create({
    page: {
        fontSize: 10,
        paddingTop: 30,
        paddingBottom: 50,
        paddingHorizontal: 35,
        color: '#333333',
        fontFamily: ENGLISH_FONT_FAMILY, // Base font for the page
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
    },
    documentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222222',
        fontFamily: ENGLISH_FONT_FAMILY, // Assuming title is English
    },
    documentSubtitle: {
        fontSize: 9,
        color: '#555555',
        marginTop: 2,
        fontFamily: ENGLISH_FONT_FAMILY, // Assuming subtitle is English
    },
    topSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    topLeft: { width: '60%', paddingRight: 10 },
    topRight: { width: '40%' },
    infoBox: { borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 3, marginBottom: 10 },
    infoBoxTitle: {
        backgroundColor: '#F5F5F5',
        padding: 6,
        fontSize: 11,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        color: '#333333',
        fontFamily: ENGLISH_FONT_FAMILY, // Assuming titles are English
    },
    infoRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
    infoRowLast: { flexDirection: 'row' },
    infoLabel: {
        width: '38%',
        padding: 6,
        fontWeight: 'bold',
        fontSize: 9,
        color: '#555555',
        borderRightWidth: 1,
        borderRightColor: '#EEEEEE',
        fontFamily: ENGLISH_FONT_FAMILY, // Assuming labels are English
    },
    infoValue: { // This style will be passed to SmartText, which will handle font per segment
        width: '62%',
        padding: 6,
        fontSize: 9,
        color: '#333333',
        // fontFamily is NOT set here, SmartText will manage it
    },
    itemsTable: { borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 3, marginTop: 10, marginBottom: 15 },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        fontSize: 10,
    },
    tableHeaderText: { // Style for <Text> inside tableHeader cells
        fontWeight: 'bold',
        fontFamily: ENGLISH_FONT_FAMILY, // Assuming headers are English
        color: '#333333',
    },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEEEEE' },
    tableRowLast: { flexDirection: 'row' },
    th: { paddingVertical: 6, paddingHorizontal: 5, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#DDDDDD' },
    thNoBorder: { borderRightWidth: 0 },
    td: { // Base style for table data cells
        paddingVertical: 6,
        paddingHorizontal: 5,
        fontSize: 9,
        borderRightWidth: 1,
        borderRightColor: '#EEEEEE',
        // fontFamily is NOT set here, SmartText will manage it for mixed content cells
    },
    tdNoBorder: { borderRightWidth: 0 },
    colIndex: { width: '10%', textAlign: 'center' },
    colDesc: { width: '50%' }, // This column will use SmartText for item.itemName
    colType: { width: '20%', textAlign: 'center' }, // This column might use SmartText for item.itemType
    colQty: { width: '20%', textAlign: 'center' },
    totalRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#CCCCCC', backgroundColor: '#FAFAFA' },
    totalLabelCell: {
        width: '80%',
        padding: 6,
        textAlign: 'right',
        fontSize: 10,
        fontWeight: 'bold',
        borderRightWidth: 1,
        borderRightColor: '#CCCCCC',
        fontFamily: ENGLISH_FONT_FAMILY,
    },
    totalValueCell: {
        width: '20%',
        padding: 6,
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: ENGLISH_FONT_FAMILY, // Numbers, so English font is fine
    },
    confirmationSection: { borderWidth: 1, borderColor: '#DDDDDD', padding: 10, marginTop: 10, marginBottom: 15, borderRadius: 3 },
    confirmationTitle: {
        fontWeight: 'bold',
        fontSize: 10,
        textAlign: 'center',
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        marginBottom: 8,
        color: '#444444',
        fontFamily: ENGLISH_FONT_FAMILY,
    },
    confirmationText: { // For T&C text, assuming primarily English
        fontSize: 7.5,
        marginBottom: 6,
        lineHeight: 1.3,
        color: '#666666',
        textAlign: 'justify',
        fontFamily: ENGLISH_FONT_FAMILY,
    },
    confirmationPoint: { flexDirection: 'row', marginBottom: 4 },
    confirmationNumber: {
        width: '4%',
        fontSize: 7.5,
        fontWeight: 'bold',
        color: '#555555',
        lineHeight: 1.3,
        fontFamily: ENGLISH_FONT_FAMILY,
    },
    confirmationPointText: { // For T&C text points
        width: '96%',
        fontSize: 7.5,
        color: '#666666',
        lineHeight: 1.3,
        textAlign: 'justify',
        fontFamily: ENGLISH_FONT_FAMILY,
    },
    boldTextTnC: { // For bold parts within T&C
        fontWeight: 'bold',
        color: '#555555', // This will be nested in a Text with English font
    },
    receiverDetailsSection: { borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 3, marginTop: 10 },
    signatureBox: { height: 40 },
    pageNumber: {
        position: 'absolute',
        fontSize: 8,
        bottom: 25,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#AAAAAA',
        fontFamily: ENGLISH_FONT_FAMILY,
    },
});

// --- MAIN DOCUMENT COMPONENT ---
export const GoodsReceivedDocument: React.FC<GoodsReceivedDocumentProps> = ({ data, imageStaticData }) => {
    const totalQuantity = data.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const providerName = "The Provider"; // Static English term

    return (
        <Document title={`Goods Received - ${data.orderNumber}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.header} fixed>
                    <Text style={styles.documentTitle}>GOODS RECEIVED NOTE</Text>
                    {/* <Text style={styles.documentSubtitle}>Order No: {String(data.orderNumber) || imageStaticData.orderNoIntRef}</Text> */}
                </View>

                <View style={styles.topSection}>
                    <View style={styles.topLeft}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoBoxTitle}>Customer Information</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Company Name</Text>
                                <SmartText style={styles.infoValue}>{data.customerName}</SmartText>
                            </View>
                            <View style={styles.infoRowLast}>
                                <Text style={styles.infoLabel}>Receiver Name</Text>
                                <SmartText style={styles.infoValue}>{imageStaticData.receiverName}</SmartText>
                            </View>
                        </View>
                    </View>
                    {/* ... other top sections ... */}
                    <View style={styles.topRight}>
                        <View style={styles.infoBox}>
                            <View style={styles.infoRow}>
                                <Text style={[ styles.infoLabel, { width: '40%' } ]}>Form Date</Text>
                                <Text style={[ styles.infoValue, { width: '60%', fontFamily: ENGLISH_FONT_FAMILY } ]}>{imageStaticData.formDate}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Receive Date</Text>
                                <Text style={[ styles.infoValue, { fontFamily: ENGLISH_FONT_FAMILY } ]}>{data.createdAt ? format(new Date(data.createdAt), 'dd-MM-yyyy') : imageStaticData.receiveDate}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Customer Ref.</Text>
                                <SmartText style={styles.infoValue}>{imageStaticData.customerRef || '-'}</SmartText>
                            </View>
                            <View style={styles.infoRowLast}>
                                <Text style={styles.infoLabel}>Order No. (Int)</Text>
                                <Text style={[ styles.infoValue, { fontFamily: ENGLISH_FONT_FAMILY } ]}>{String(data.orderNumber) || imageStaticData.orderNoIntRef}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.itemsTable}>
                    <View style={styles.tableHeader}>
                        <Text style={[ styles.th, styles.colIndex, styles.tableHeaderText ]}>#</Text>
                        <Text style={[ styles.th, styles.colDesc, styles.tableHeaderText ]}>Description of Goods</Text>
                        <Text style={[ styles.th, styles.colType, styles.tableHeaderText ]}>Item Type</Text>
                        <Text style={[ styles.th, styles.colQty, styles.thNoBorder, styles.tableHeaderText ]}>Quantity</Text>
                    </View>
                    {data.items.map((item, index) => (
                        <View key={`item-${index}`} style={index === data.items.length - 1 ? styles.tableRowLast : styles.tableRow}>
                            <Text style={[ styles.td, styles.colIndex, { fontFamily: ENGLISH_FONT_FAMILY } ]}>{index + 1}</Text>
                            <SmartText style={[ styles.td, styles.colDesc ]}>{item.itemName}</SmartText>
                            <SmartText style={[ styles.td, styles.colType ]}>{item.itemType || '-'}</SmartText>
                            <Text style={[ styles.td, styles.colQty, styles.tdNoBorder, { fontFamily: ENGLISH_FONT_FAMILY } ]}>{item.quantity}</Text>
                        </View>
                    ))}
                    {data.items.length === 0 && (
                        <View style={styles.tableRowLast}>
                            <Text style={[ styles.td, { width: '100%', textAlign: 'center', borderRightWidth: 0, fontFamily: ENGLISH_FONT_FAMILY } ]}>No items listed.</Text>
                        </View>
                    )}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabelCell}>Total Quantity</Text>
                        <Text style={[ styles.totalValueCell, styles.tdNoBorder ]}>{totalQuantity}</Text>
                    </View>
                </View>

                <View style={styles.confirmationSection} wrap={false}>
                    <Text style={styles.confirmationTitle}>Receiver Confirmation</Text>
                    <Text style={styles.confirmationText}>
                        I, the undersigned, confirm that I have thoroughly inspected and verified the goods listed above upon receipt. I acknowledge that:
                    </Text>
                    <View style={styles.confirmationPoint}>
                        <Text style={styles.confirmationNumber}>1.</Text>
                        <Text style={styles.confirmationPointText}>
                            <Text style={styles.boldTextTnC}>All goods have been received in full and in satisfactory condition</Text>
                            <Text>, as per the details provided above.</Text>
                        </Text>
                    </View>
                    <View style={styles.confirmationPoint}>
                        <Text style={styles.confirmationNumber}>2.</Text>
                        <Text style={styles.confirmationPointText}>
                            <Text style={styles.boldTextTnC}>I accept full responsibility for the goods from the point of receipt</Text>
                            <Text>, and I understand that {providerName} will not be held liable for any damages, defects, shortages, or issues discovered after the goods have been signed for and received.</Text>
                        </Text>
                    </View>
                    <View style={styles.confirmationPoint}>
                        <Text style={styles.confirmationNumber}>3.</Text>
                        <Text style={styles.confirmationPointText}>
                            {providerName} disclaims any further responsibility for the goods once they have been handed over to the customer or the customer's agent. Any loss, damage, or deterioration occurring after this point is solely the responsibility of the customer.
                        </Text>
                    </View>
                </View>

                <View style={styles.receiverDetailsSection} wrap={false}>
                    <Text style={styles.infoBoxTitle}>Receiver Details & Signature</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Receiver's/Agent Name</Text>
                        <SmartText style={styles.infoValue}>{imageStaticData.receiverName}</SmartText>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mobile No.</Text>
                        <Text style={[ styles.infoValue, { fontFamily: ENGLISH_FONT_FAMILY } ]}>{imageStaticData.receiverMobile}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>EID Number</Text>
                        <Text style={[ styles.infoValue, { fontFamily: ENGLISH_FONT_FAMILY } ]}>{imageStaticData.receiverEid}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Date Received</Text>
                        <Text style={[ styles.infoValue, { fontFamily: ENGLISH_FONT_FAMILY } ]}></Text>
                    </View>
                    <View style={styles.infoRowLast}>
                        <Text style={styles.infoLabel}>Signature & Stamp</Text>
                        <View style={[ styles.infoValue, styles.signatureBox ]}></View>
                    </View>
                </View>

                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
};