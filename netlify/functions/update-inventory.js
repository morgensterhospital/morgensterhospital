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
    const { items, updatedBy } = JSON.parse(event.body)

    // Update inventory
    await db.collection('app_config').doc('inventory').set({
      items: items.map(item => ({
        ...item,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      })),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    })

    // Create notification
    await db.collection('notifications').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: updatedBy,
      message: `Inventory updated - ${items.length} items modified`,
      triggeredBy: 'inventory_system'
    })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        itemsUpdated: items.length,
        message: 'Inventory updated successfully'
      })
    }

  } catch (error) {
    console.error('Error updating inventory:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to update inventory', 
        details: error.message 
      })
    }
  }
}