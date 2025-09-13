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
    toDate.setHours(23, 59, 59, 999);

    // Step 1: Fetch all invoices within the date range
    const invoicesQuery = db.collectionGroup('invoices')
      .where('creationDate', '>=', fromDate)
      .where('creationDate', '<=', toDate);
    const invoicesSnapshot = await invoicesQuery.get();

    if (invoicesSnapshot.empty) {
        const emptyReport = {
            totalSales: 0, totalCash: 0, totalEft: 0, totalUnpaid: 0,
            topSellingItems: [], salesTransactions: [], cashTransactions: [],
            eftTransactions: [], unpaidTransactions: [],
        };
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(emptyReport),
        };
    }
    
    // Step 2: Prepare for parallel data fetching
    const patientIdSet = new Set();
    const itemPromises = [];
    invoicesSnapshot.docs.forEach(doc => {
      const patientId = doc.ref.parent.parent.id;
      patientIdSet.add(patientId);
      // Create a promise to fetch items for each invoice and add it to an array
      itemPromises.push(doc.ref.collection('items').get());
    });

    // Step 3: Fetch all unique patients in parallel batches
    const patientCache = new Map();
    const allPatientIds = Array.from(patientIdSet);
    const patientPromises = [];
    // Firestore 'in' query is limited (e.g., to 30 values), so we batch the requests
    const chunkSize = 10;
    for (let i = 0; i < allPatientIds.length; i += chunkSize) {
      const chunk = allPatientIds.slice(i, i + chunkSize);
      if (chunk.length > 0) {
        const query = db.collection('patients').where(db.FieldPath.documentId(), 'in', chunk).get();
        patientPromises.push(query);
      }
    }

    // Execute all patient and item fetching concurrently
    const [patientSnapshots, allItemsSnapshots] = await Promise.all([
        Promise.all(patientPromises),
        Promise.all(itemPromises)
    ]);

    // Populate the patient cache from the fetched results
    patientSnapshots.forEach(snapshot => {
      snapshot.forEach(doc => {
        patientCache.set(doc.id, { id: doc.id, ...doc.data() });
      });
    });


    // Step 4: Process all the fetched data synchronously
    let totalSales = 0, totalCash = 0, totalEft = 0, totalUnpaid = 0;
    const salesTransactions = [], cashTransactions = [], eftTransactions = [], unpaidTransactions = [];
    const itemsSold = new Map();

    invoicesSnapshot.docs.forEach((doc, index) => {
      const invoice = doc.data();

      // Skip invoice if essential data is missing or invalid
      if (!invoice.creationDate || typeof invoice.creationDate.toDate !== 'function' || typeof invoice.totalAmount !== 'number') {
        console.warn('Skipping invoice with invalid data:', doc.id);
        return; // continue forEach
      }
      
      const patientId = doc.ref.parent.parent.id;
      const patient = patientCache.get(patientId);
      const patientName = patient ? `${patient.name || ''} ${patient.surname || ''}`.trim() : 'Unknown Patient';

      const transaction = {
        patientId,
        patientName,
        date: invoice.creationDate.toDate().toISOString(),
        amount: invoice.totalAmount || 0,
      };

      totalSales += invoice.totalAmount;
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

      // Aggregate items using the pre-fetched item snapshots for this invoice
      const itemsSnapshot = allItemsSnapshots[index];
      itemsSnapshot.forEach(itemDoc => {
        const item = itemDoc.data();
        if (!item || !item.id || typeof item.quantity !== 'number' || typeof item.totalPrice !== 'number') {
          console.warn(`Skipping malformed item in invoice ${doc.id}:`, item);
          return;
        }
        const existingItem = itemsSold.get(item.id) || {
          id: item.id,
          name: item.description || 'Unnamed Item',
          quantitySold: 0,
          totalRevenue: 0,
        };
        existingItem.quantitySold += item.quantity;
        existingItem.totalRevenue += item.totalPrice;
        itemsSold.set(item.id, existingItem);
      });
    });

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
