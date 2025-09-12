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
    const { patientId, recordType, data, authorId } = JSON.parse(event.body)

    let collectionName = ''
    let recordData = {
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      authorRef: db.doc(`users/${authorId}`)
    }

    // Determine collection based on record type
    switch (recordType) {
      case 'vitals':
        collectionName = 'vitals'
        recordData.recordedByRef = recordData.authorRef
        delete recordData.authorRef
        break
      case 'doctors_notes':
        collectionName = 'doctors_notes'
        break
      case 'nurses_notes':
        collectionName = 'nurses_notes'
        break
      case 'prescriptions':
        collectionName = 'prescriptions'
        recordData.status = 'ordered'
        recordData.orderedByRef = recordData.authorRef
        delete recordData.authorRef
        break
      case 'lab_requests':
        collectionName = 'lab_requests'
        recordData.status = 'incoming'
        recordData.requestedByRef = recordData.authorRef
        delete recordData.authorRef
        break
      case 'radiology_requests':
        collectionName = 'radiology_requests'
        recordData.status = 'incoming'
        recordData.requestedByRef = recordData.authorRef
        delete recordData.authorRef
        break
      case 'rehabilitation_notes':
        collectionName = 'rehabilitation_notes'
        break
      case 'admission_discharge':
        collectionName = 'admission_discharge'
        recordData.authorizedByRef = recordData.authorRef
        delete recordData.authorRef
        break
      default:
        throw new Error('Invalid record type')
    }

    // Add the record
    const recordRef = await db.collection(`patients/${patientId}/${collectionName}`).add(recordData)

    // Create notification
    await db.collection('notifications').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: authorId,
      message: `${recordType.replace('_', ' ')} added for patient ${patientId}`,
      triggeredBy: 'medical_system'
    })

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        recordId: recordRef.id,
        recordType,
        message: `${recordType} added successfully`
      })
    }

  } catch (error) {
    console.error('Error adding medical record:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to add medical record', 
        details: error.message 
      })
    }
  }
}