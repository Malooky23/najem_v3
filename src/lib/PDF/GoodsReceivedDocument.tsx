// src/lib/PDF/GoodsReceivedDocument.tsx
import React from 'react';
import { EnrichedOrderSchemaType } from '@/types/orders';
import { format } from 'date-fns';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';


Font.register({
    family: "NotoSansArabic",
    fonts: [
        { src: '/fonts/NotoSansArabic-Regular.ttf', fontStyle: 'normal', fontWeight: 'normal' },
        { src: '/fonts/NotoSansArabic-Bold.ttf', fontStyle: 'normal', fontWeight: 'bold' },
    ],
});
Font.register({
    family: "tajawal",
    fonts: [
        { src: '/fonts/tajawal.ttf', fontStyle: 'normal', fontWeight: 'normal' },
        { src: '/fonts/tajawal.ttf', fontStyle: 'normal', fontWeight: 'bold' },
    ],
});
Font.register({
    family: "Almarai",
    fonts: [
        { src: '/fonts/Almarai/Almarai-Regular.ttf', fontStyle: 'normal', fontWeight: 'normal' },
        { src: '/fonts/Almarai/Almarai-Bold.ttf', fontStyle: 'normal', fontWeight: 'bold' },
    ],
});

Font.registerEmojiSource({
    format: 'png',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/',
});

interface OrderItem {
    itemName: string;
    quantity: number;
    itemType?: string; // Added as it's used in the table
}

interface GoodsReceivedDocumentProps {
    data: EnrichedOrderSchemaType;
    imageStaticData: {
        formDate: string; // Assumed to be pre-formatted
        receiveDate: string; // Assumed to be pre-formatted, used as fallback
        customerRef?: string;
        orderNoIntRef: string;
        receiverName: string;
        receiverMobile: string;
        receiverEid: string;

    };
    companyName?: string; // Optional: for header
    companyLogo?: string; // Optional: URL or path to logo
}

const styles = StyleSheet.create({
    page: {
        fontSize: 10,
        paddingTop: 30,
        paddingBottom: 50, // Increased padding for footer/page number
        paddingHorizontal: 35,
        color: '#333333',
        fontFamily: 'Almarai'

    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
    },
    companyDetails: {
        maxWidth: '60%',
    },
    companyName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#222222',
        marginBottom: 2,
    },
    documentTitleContainer: {
        textAlign: 'left',
    },
    documentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222222',
    },
    documentSubtitle: {
        fontSize: 9,
        color: '#555555',
    },
    infoBox: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 3,
        marginBottom: 10,
    },
    infoBoxTitle: {
        backgroundColor: '#F5F5F5',
        padding: 6,
        fontSize: 11,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        color: '#333333',
    },
    infoRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    infoRowLast: { // No bottom border for the last row in a box
        flexDirection: 'row',
    },
    infoLabel: {
        width: '15%', // Adjusted for consistent look
        padding: 6,
        fontWeight: 'bold',
        fontSize: 9,
        color: '#555555',
        borderRightWidth: 1,
        borderRightColor: '#EEEEEE',
    },
    infoValue: {
        width: '85%', // Adjusted for consistent look
        padding: 6,
        fontSize: 9,
        color: '#333333',
    },
    itemsTable: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 3,
        marginTop: 10,
        marginBottom: 15,
        fontFamily: [ 'Almarai', 'Helvetica', 'Courier', 'Times-Roman' ]

    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        fontWeight: 'bold',
        fontSize: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        fontFamily: "Almarai"

    },
    tableRowLast: { // No bottom border for the last item row
        flexDirection: 'row',
        fontFamily: "Almarai"


    },
    th: {
        paddingVertical: 6,
        paddingHorizontal: 5,
        textAlign: 'center',
        borderRightWidth: 1,
        borderRightColor: '#DDDDDD',
        color: '#333333',
    },
    thNoBorder: {
        borderRightWidth: 0,
    },
    td: {
        paddingVertical: 6,
        paddingHorizontal: 5,
        fontSize: 9,
        borderRightWidth: 1,
        borderRightColor: '#EEEEEE',
    },
    tdNoBorder: {
        borderRightWidth: 0,
    },
    colIndex: { width: '10%', textAlign: 'center' },
    colDesc: { width: '50%' },
    colType: { width: '20%', textAlign: 'center' },
    colQty: { width: '20%', textAlign: 'center' },
    totalRow: {
        flexDirection: 'row',
        fontWeight: 'bold',
        borderTopWidth: 1,
        borderTopColor: '#CCCCCC',
        backgroundColor: '#FAFAFA',
    },
    totalLabelCell: {
        width: '80%', // Sum of index, desc, type
        padding: 6,
        textAlign: 'right',
        fontSize: 10,
        borderRightWidth: 1,
        borderRightColor: '#CCCCCC',
    },
    totalValueCell: {
        width: '20%', // Qty column
        padding: 6,
        textAlign: 'center',
        fontSize: 10,
    },
    // Styles for Terms and Conditions (Receiver Confirmation)
    termsAndConditionsSection: { // Renamed from confirmationSection for clarity if preferred, or keep as is
        borderWidth: 1,
        borderColor: '#DDDDDD',
        padding: 6, // Reduced padding
        marginTop: 10, // Space above this section
        marginBottom: 10, // Reduced margin below
        borderRadius: 3,
    },
    termsAndConditionsTitle: { // Renamed from confirmationTitle
        fontWeight: 'bold',
        fontSize: 10,
        textAlign: 'center',
        paddingBottom: 3, // Reduced padding
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        marginBottom: 5, // Reduced margin
        color: '#444444',
    },
    termsAndConditionsText: { // Renamed from confirmationText
        fontSize: 7.5,
        marginBottom: 4, // Reduced margin
        lineHeight: 1.3,
        color: '#666666',
        textAlign: 'justify',
    },
    termsAndConditionsPoint: { // Renamed from confirmationPoint
        flexDirection: 'row',
        marginBottom: 3, // Reduced margin
    },
    termsAndConditionsNumber: { // Renamed from confirmationNumber
        width: '4%',
        fontSize: 7.5,
        fontWeight: 'bold',
        color: '#555555',
        lineHeight: 1.3,
    },
    termsAndConditionsPointText: { // Renamed from confirmationPointText
        width: '96%',
        fontSize: 7.5,
        color: '#666666',
        lineHeight: 1.3,
        textAlign: 'justify',
    },
    boldTextTnC: {
        fontWeight: 'bold',
        color: '#555555',
    },
    receiverDetailsSection: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 3,
        marginTop: 10, // Keep margin from items table
        // marginBottom: 15, // Removed as T&C will follow
    },
    signatureBox: {
        height: 40,
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 8,
        bottom: 25,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#AAAAAA',
    },
    topInfoContainer: {
        marginBottom: 15,
    },
    compactInfoRow: {
        flexDirection: 'row',
    },
    compactField: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 5,
        borderRightWidth: 1,
        borderRightColor: '#EEEEEE',
        alignItems: 'flex-start',
    },
    compactFieldLast: {
        borderRightWidth: 0,
    },
    compactLabel: {
        fontWeight: 'bold',
        fontSize: 9,
        color: '#555555',
        marginRight: 4,
    },
    compactValue: {
        fontSize: 9,
        color: '#333333',
        flexShrink: 1,
    },
});


export const GoodsReceivedDocument: React.FC<GoodsReceivedDocumentProps> = ({ data, imageStaticData, companyName = "Your Company Name" }) => {
    const totalQuantity = data.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    console.log(JSON.stringify(data, null, 2))

    // function normalizeArabicString(str:string) { ... } // Removed for brevity as not directly part of the change

    return (
        <Document title={`Goods Received - ${data.orderNumber}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.header} fixed>
                    <View style={styles.documentTitleContainer}>
                        <Text style={styles.documentTitle}>GOODS RECEIVED NOTE</Text>
                    </View>
                </View>

                <View style={styles.topInfoContainer}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoBoxTitle}>Order & Customer Details</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Customer</Text>
                            <Text style={styles.infoValue}>{data.customerName}</Text>
                        </View>
                        <View style={styles.compactInfoRow}>
                            <View style={styles.compactField}>
                                <Text style={styles.compactLabel}>Order No.:</Text>
                                <Text style={styles.compactValue}>{String(data.orderNumber) || imageStaticData.orderNoIntRef}</Text>
                            </View>
                            <View style={styles.compactField}>
                                <Text style={styles.compactLabel}>Order Date:</Text>
                                <Text style={styles.compactValue}>
                                    {data.createdAt ? format(new Date(data.createdAt), 'dd-MM-yyyy') : imageStaticData.receiveDate}
                                </Text>
                            </View>
                            <View style={[ styles.compactField, styles.compactFieldLast ]}>
                                <Text style={styles.compactLabel}>Customer Ref.:</Text>
                                <Text style={styles.compactValue}>{imageStaticData.customerRef || '-'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.itemsTable}>
                    <View style={styles.tableHeader}>
                        <Text style={[ styles.th, styles.colIndex ]}>#</Text>
                        <Text style={[ styles.th, styles.colDesc ]}>Description of Goods</Text>
                        <Text style={[ styles.th, styles.colType ]}>Item Type</Text>
                        <Text style={[ styles.th, styles.colQty, styles.thNoBorder ]}>Quantity</Text>
                    </View>
                    {data.items.map((item, index) => (
                        <View key={`item-${index}`} style={index === data.items.length - 1 ? styles.tableRowLast : styles.tableRow}>
                            <Text style={[ styles.td, styles.colIndex ]}>{index + 1}</Text>
                            <Text style={[ styles.td, styles.colDesc ]}>{item.itemName}</Text>
                            <Text style={[ styles.td, styles.colType ]}>{item.itemType || '-'}</Text>
                            <Text style={[ styles.td, styles.colQty, styles.tdNoBorder ]}>{item.quantity}</Text>
                        </View>
                    ))}
                    {data.items.length === 0 && (
                        <View style={styles.tableRowLast}>
                            <Text style={[ styles.td, { width: '100%', textAlign: 'center', borderRightWidth: 0 } ]}>No items listed.</Text>
                        </View>
                    )}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabelCell}>Total Quantity</Text>
                        <Text style={[ styles.totalValueCell, styles.tdNoBorder ]}>{totalQuantity}</Text>
                    </View>
                </View>

                {/* Receiver Details Section - MOVED UP */}
                <View style={styles.receiverDetailsSection} wrap={false}>
                    <Text style={styles.infoBoxTitle}>Receiver Details & Signature</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Receiver's Name</Text>
                        <Text style={styles.infoValue}>{imageStaticData.receiverName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mobile No.</Text>
                        <Text style={styles.infoValue}>{imageStaticData.receiverMobile}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>EID Number</Text>
                        <Text style={styles.infoValue}>{imageStaticData.receiverEid}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Date</Text>
                        <Text style={styles.infoValue}></Text>{/* Typically filled by hand */}
                    </View>
                    <View style={styles.infoRowLast}>
                        <Text style={styles.infoLabel}>Signature</Text>
                        <View style={[ styles.infoValue, styles.signatureBox ]}></View>
                    </View>
                </View>

                {/* Terms and Conditions Section - MOVED DOWN and styles adjusted */}
                {/* I've renamed style keys from 'confirmation...' to 'termsAndConditions...' for clarity, update styles definition accordingly */}
                <View style={styles.termsAndConditionsSection} wrap={false}>
                    <Text style={styles.termsAndConditionsTitle}>Receiver Confirmation</Text>
                    <Text style={styles.termsAndConditionsText}>
                        I, the undersigned, confirm that I have thoroughly inspected and verified the goods listed above upon receipt. I acknowledge that:
                    </Text>
                    <View style={styles.termsAndConditionsPoint}>
                        <Text style={styles.termsAndConditionsNumber}>1.</Text>
                        <Text style={styles.termsAndConditionsPointText}>
                            <Text style={styles.boldTextTnC}>All goods have been received in full and in satisfactory condition</Text>
                            <Text>, as per the details provided above.</Text>
                        </Text>
                    </View>
                    <View style={styles.termsAndConditionsPoint}>
                        <Text style={styles.termsAndConditionsNumber}>2.</Text>
                        <Text style={styles.termsAndConditionsPointText}>
                            <Text style={styles.boldTextTnC}>I accept full responsibility for the goods from the point of receipt</Text>
                            <Text>, and I understand that {companyName} will not be held liable for any damages, defects, shortages, or issues discovered after the goods have been signed for and received.</Text>
                        </Text>
                    </View>
                    <View style={styles.termsAndConditionsPoint}>
                        <Text style={styles.termsAndConditionsNumber}>3.</Text>
                        <Text style={styles.termsAndConditionsPointText}>
                            {companyName} disclaims any further responsibility for the goods once they have been handed over to the customer or the customer's agent. Any loss, damage, or deterioration occurring after this point is solely the responsibility of the customer.
                        </Text>
                    </View>
                </View>


                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
};