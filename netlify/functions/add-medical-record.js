import admin from 'firebase-admin'

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: "morgensterhospital-1088c",
      private_key_id: "79a3ebeb56f60989f1f603c3ea70926595d4ca12",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCHRT/+8n3NUPQ6\nhAGgT8EVpvZGrKJqzY1mPXqO9FatkfbW5kvKCnVxArBhd0bQsMifDxlQwFEZ27fp\niRvzsMslvIHxiu90YSuZjmtsXme6/nSQi2ibCBzcUaaDJG9SXlqFwMG6td/+n4Ep\nwkEhntSxLwIbW6yRvHrnYTaibPMH/lLM2wlL3qeK9ezf0Rlu/1sL47ylc6XZuBvz\n7hBUTfTJFP8BTPXNhTvvjJo3O8kAh23sgFLrW/6eZIcRomal+ci/22t0CfN/8gF2\nwa78Tndtr+BLXp09hbjVJnqb/iB3v5KJGosRtGoR5jpPedqfxsKkXxXtjLaANsHU\nM8DtjTl9AgMBAAECggEAJlbjV5BFRb8vKbKmf1h7gnaLEOb3NcxCynqcVQ49zv4y\n9x/Y1U/3j2tSsJ1M7fNdOW/fHfsUQX779m4NBRnTykNOlTZqvhKYd/Jc0h9DyUU7\npohMwrwe6fceeccG4lKp14UVo6TO8u0kf8B2E2BgKkQHldd65ueD8jakdI7qpxXt\nxxQTWGlLrA6myGoyxksZue4wRypE8VlMKB8j+IvI2dk0tvtDSqB4r6u1pajU4quH\nJ2HruZHBJZKmkkuWSasY3SbfLPOXGbGC278OJiTs0+7JVGeAyj578f/WgvfEhUs4\nLkAELAbgB2XsVoXgsp27iFMOMMuV5QcAyNo9XUViRQKBgQC6lb6TJk53rUJgSG3C\nAP3KmsddfVO/LI6hCPgXFqyO0J+dsNg4cyPJLlD1SXZ/y9AmrnjtiWUSTsWYrr7a\nX6g2BYD2O1bODohfB0H4xfUFYvvlc9UnI6WofeXHA5cfxZ8Ou6JTxz0g7ISqS3m+\nUZG6n/PTdVGUujqq0kRTJjqlIwKBgQC5mFhPjO7TmsybZGwv2tuYOmzXe3FdYr/4\n5JpuuPf4nZ7szIkM7n+q9KltUD/+OaFhlLPgNu4+jqmOGzFhZT11OynKDUoyJWWM\nJYS61x1wbmg3fmXDa9/JG+WU+XcCuI2QpBRjLAxrawIcwDtGBEZW5AJtStKPA7q1\n+IIQ4ZEg3wKBgHqTUWV+LuJ0UjzKmEBxQklNsVd7s/7NmM22BLW2UZpo99MykHlV\nOtc5tDnQDycZkB85U3xJXLrQQQNzGTKA0RLcPsKEbRxlc7VqIS77bWIiivVMSWWz\nB2tPehpqA2f9/eZB4fxD0abFesodV1duYtxFpHrwga3BQjVieTxeyvwdAoGBAKQ5\nuRMTSxV1Kc3qy4yA5cVLFZqLAaI3ylUru7dz9wBIQSOaTT9jHxcgDXfMBgQn7LRT\nB+PD14cFZ+V2DHj5Q6ujYXQH1HqQ+s1LOaq2xLcDCzbnopaMsuXayIjNQdDni2TM\nu7mRdZ/rfWABfbGUAMXMVpVtGuovy5xPvI/BeVETAoGAXdom8YpdlLLyk6kZz95X\nr+J7E5fZ+OuOIvJVAghH/FOM0EUB90XXAM7M76d3RCLO7hRsHp7NazBG0YpbEx1a\nE5rwlajrHrX8ZQXFqx+ZEQP7/K1hlUiQ0+19yj82re1IInkKRPiSlZcOEZRisIsE\nVsiyGVwkBlfdocO/G+/WEB0=\n",
      client_email: "firebase-adminsdk-fbsvc@morgensterhospital-1088c.iam.gserviceaccount.com",
      client_id: "102076691026870342948",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40morgensterhospital-1088c.iam.gserviceaccount.com",
      universe_domain: "googleapis.com"
    }),
    projectId: "morgensterhospital-1088c"
  })
}

const db = admin.firestore()

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