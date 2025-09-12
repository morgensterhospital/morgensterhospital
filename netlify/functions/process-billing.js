import { db } from './lib/firebase-admin.js';
import admin from 'firebase-admin';

export const handler = async (event, context) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { patientId, items, paymentMethod, amountPaid, processedBy } = JSON.parse(event.body)

    // Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const balance = totalAmount - (amountPaid || 0)
    const status = balance <= 0 ? 'paid' : 'unpaid'

    // Create invoice
    const invoiceRef = await db.collection(`patients/${patientId}/invoices`).add({
      status,
      creationDate: admin.firestore.FieldValue.serverTimestamp(),
      totalAmount,
      amountPaid: amountPaid || 0,
      balance: Math.max(0, balance),
      paymentMethod,
      processedByRef: db.doc(`users/${processedBy}`)
    })

    // Add items to invoice and update inventory
    const batch = db.batch();
    const inventoryRef = db.collection('app_config').doc('inventory');

    for (const item of items) {
      const itemRef = db.collection(`patients/${patientId}/invoices/${invoiceRef.id}/items`).doc();
      batch.set(itemRef, item);

      // Decrement inventory
      const inventoryItemRef = db.collection('app_config').doc('inventory');
      batch.update(inventoryItemRef, {
        [`items.${item.id}.stockLevel`]: admin.firestore.FieldValue.increment(-item.quantity)
      });
    }
    
    await batch.commit();

    // Create notification for payment
    await db.collection('notifications').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: processedBy,
      message: `Invoice processed for patient ${patientId}. Amount: M${totalAmount.toFixed(2)}`,
      triggeredBy: 'billing_system'
    })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        invoiceId: invoiceRef.id,
        totalAmount,
        amountPaid: amountPaid || 0,
        balance: Math.max(0, balance),
        status,
        message: 'Bill processed successfully'
      })
    }

  } catch (error) {
    console.error('Error processing billing:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to process billing', 
        details: error.message 
      })
    }
  }
}