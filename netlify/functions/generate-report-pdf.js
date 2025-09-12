import { db } from './lib/firebase-admin.js';
import PDFDocument from 'pdfkit';

const generateBillingReport = async (patientId) => {
  const patientDoc = await db.collection('patients').doc(patientId).get();
  const patient = patientDoc.data();

  const invoicesSnapshot = await db.collection(`patients/${patientId}/invoices`).get();
  const invoices = invoicesSnapshot.docs.map(doc => doc.data());

  const doc = new PDFDocument({ margin: 50 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  // Header
  doc.fontSize(20).text('Morgenster Hospital', { align: 'center' });
  doc.fontSize(12).text('Patient Billing History', { align: 'center' });
  doc.moveDown();

  // Patient Details
  doc.fontSize(14).text('Patient Details', { underline: true });
  doc.text(`Name: ${patient.name} ${patient.surname}`);
  doc.text(`Hospital Number: ${patient.hospitalNumber}`);
  doc.moveDown();

  // Invoices
  invoices.forEach(invoice => {
    doc.fontSize(12).text(`Invoice Date: ${new Date(invoice.creationDate.seconds * 1000).toLocaleDateString()}`, { underline: true });
    doc.text(`Total Amount: ${invoice.totalAmount}`);
    doc.text(`Amount Paid: ${invoice.amountPaid}`);
    doc.text(`Balance: ${invoice.balance}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown();
  });

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
    doc.end();
  });
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { reportType, patientId } = JSON.parse(event.body);

  if (reportType === 'patient_billing_history' && patientId) {
    const pdfBuffer = await generateBillingReport(patientId);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/pdf' },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  }

  return { statusCode: 400, body: 'Invalid report type or missing patient ID' };
};