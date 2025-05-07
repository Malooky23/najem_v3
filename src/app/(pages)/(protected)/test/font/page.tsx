'use client'
// components/TestArabicPdf.tsx (or similar)
import React from 'react';
import { Page, Text, Document, StyleSheet, PDFViewer, Font } from '@react-pdf/renderer';

// Ensure Font.register has been called globally (as in Step 2)
const ENGLISH_FONT_FAMILY = 'Helvetica';


const ARABIC_FONT_FAMILY = 'Rubik';
// const ARABIC_FONT_FAMILY = 'NotoNaskhArabic'

Font.register({
  family: ARABIC_FONT_FAMILY,
  fonts: [
      { src: '/fonts/Rubik-Regular.ttf', fontStyle: 'normal', fontWeight: 'normal' },
      { src: '/fonts/Rubik-Bold.ttf', fontStyle: 'normal', fontWeight: 'bold' },
  ],
});
Font.register({
    family: ARABIC_FONT_FAMILY,
    fonts: [
        { src: '/fonts/NotoSansArabic-Regular.ttf' }, // Path from root if served from public
        { src: '/fonts/NotoSansArabic-Bold.ttf', fontWeight: 'bold' },
    ],
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: ENGLISH_FONT_FAMILY, // Default to English
    },
    arabicText: {
        fontFamily: ARABIC_FONT_FAMILY, // Specifically apply Arabic font
        fontSize: 12,
        marginBottom: 10,
        border: '1px solid black',
        padding: 5,
        textAlign: 'right'
    },
    englishText: {
        fontFamily: ENGLISH_FONT_FAMILY,
        fontSize: 12,
        marginBottom: 10,
        border: '1px solid black',
        padding: 5,
    }
});

const TestArabicPdf = () => (
    <Document title='test'>
        <Page size="A4" style={styles.page}>
            <Text style={styles.englishText}>Hello World (English)</Text>
            <Text style={styles.arabicText}>ﺑﺴﻜﻮﯾﺖ ﻣﻤﻠﺢ (Arabic Test 1)</Text>
            <Text style={styles.arabicText}>بسكويت بالتمر (Arabic Test 2)</Text>
            <Text style={styles.arabicText}>ﺑﺴﻜﻮﯾﺖ زﺑﺪة (Mixed - should use Noto for Arabic part)</Text>
            <Text style={styles.arabicText}>ﺑﺴﻜﻮﯾﺖ زﺑﺪة </Text>
        </Page>
    </Document>
);

const MyTestPage = () => (
  <div style={{ width: '100%', height: '100vh' }}>
    <PDFViewer width="100%" height="100%">
      <TestArabicPdf />
    </PDFViewer>
  </div>
);


export default function FontPage(){
    return (<MyTestPage/>)
}