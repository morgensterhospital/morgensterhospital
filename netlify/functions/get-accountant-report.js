import { db } from './lib/firebase-admin.js';

export const handler = async (event, context) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { startDate, endDate } = JSON.parse(event.body);

    if (!startDate || !endDate) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Start date and end date are required.' })
      };
    }

    const fromDate = new Date(startDate);
    const toDate = new Date(endDate);
    toDate.setHours(23, 59, 59, 999); // Ensure we get all invoices on the end date

    const invoicesQuery = db.collectionGroup('invoices')
      .where('creationDate', '>=', fromDate)
      .where('creationDate', '<=', toDate);

    const invoicesSnapshot = await invoicesQuery.get();

    let totalSales = 0;
    let totalCash = 0;
    let totalEft = 0;
    let totalUnpaid = 0;

    const salesTransactions = [];
    const cashTransactions = [];
    const eftTransactions = [];
    const unpaidTransactions = [];

    const itemsSold = new Map();
    const patientCache = new Map();

    const getPatient = async (patientId) => {
      if (patientCache.has(patientId)) {
        return patientCache.get(patientId);
      }
      const patientDoc = await db.collection('patients').doc(patientId).get();
      if (!patientDoc.exists) return null;
      const patientData = { id: patientDoc.id, ...patientDoc.data() };
      patientCache.set(patientId, patientData);
      return patientData;
    };

    for (const doc of invoicesSnapshot.docs) {
      const invoice = doc.data();

      // Skip invoice if essential data is missing to prevent crashes
      if (!invoice.creationDate || !invoice.totalAmount) {
        continue;
      }

      const patientId = doc.ref.parent.parent.id;
      const patient = await getPatient(patientId);
      const patientName = patient ? `${patient.name || ''} ${patient.surname || ''}`.trim() : 'Unknown Patient';

      const transaction = {
        patientId,
        patientName,
        date: invoice.creationDate.toDate().toISOString(),
        amount: invoice.totalAmount || 0,
      };

      totalSales += invoice.totalAmount || 0;
      salesTransactions.push(transaction);

      if (invoice.status === 'paid') {
        if (invoice.paymentMethod === 'Cash') {
          totalCash += invoice.amountPaid || 0;
          cashTransactions.push({ ...transaction, amount: invoice.amountPaid || 0 });
        } else if (invoice.paymentMethod === 'EFT') {
          totalEft += invoice.amountPaid || 0;
          eftTransactions.push({ ...transaction, amount: invoice.amountPaid || 0 });
        }
      } else {
        totalUnpaid += invoice.balance || 0;
        unpaidTransactions.push({ ...transaction, amount: invoice.balance || 0 });
      }

      // Aggregate items for top-selling calculation
      const itemsSnapshot = await doc.ref.collection('items').get();
      itemsSnapshot.forEach(itemDoc => {
        const item = itemDoc.data();
        const existingItem = itemsSold.get(item.id) || {
          id: item.id,
          name: item.description,
          quantitySold: 0,
          totalRevenue: 0,
        };
        existingItem.quantitySold += item.quantity;
        existingItem.totalRevenue += item.totalPrice;
        itemsSold.set(item.id, existingItem);
      });
    }

    const topSellingItems = Array.from(itemsSold.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 20);

    const reportData = {
      totalSales,
      totalCash,
      totalEft,
      totalUnpaid,
      topSellingItems,
      salesTransactions,
      cashTransactions,
      eftTransactions,
      unpaidTransactions,
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(reportData),
    };

  } catch (error) {
    console.error('Error generating accountant report:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to generate accountant report.',
        details: error.message
      })
    };
  }
};
