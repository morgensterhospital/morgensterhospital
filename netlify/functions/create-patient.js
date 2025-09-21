import { db } from './lib/firebase-admin.js';
import admin from 'firebase-admin';

// Generate unique hospital number
const generateHospitalNumber = async () => {
  const prefix = 'MHS'
  const year = new Date().getFullYear().toString().slice(-2)
  
  let isUnique = false
  let hospitalNumber = ''
  
  while (!isUnique) {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    hospitalNumber = `${prefix}${year}${random}`
    
    // Check if this number already exists
    const existingPatient = await db.collection('patients')
      .where('hospitalNumber', '==', hospitalNumber)
      .limit(1)
      .get()
    
    if (existingPatient.empty) {
      isUnique = true
    }
  }
  
  return hospitalNumber
}

// Calculate age from date of birth
const calculateAge = (dob) => {
  const today = new Date()
  const birthDate = new Date(dob)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const patientData = JSON.parse(event.body)
    const { registeredBy, ...patientInfo } = patientData

    // Generate unique hospital number
    const hospitalNumber = await generateHospitalNumber()
    
    // Calculate age
    const age = calculateAge(patientInfo.dob)

    // Create patient document
    const newPatient = {
      ...patientInfo,
      hospitalNumber,
      age,
      dob: admin.firestore.Timestamp.fromDate(new Date(patientInfo.dob)),
      registrationDate: admin.firestore.FieldValue.serverTimestamp(),
      registeredByRef: db.doc(`users/${registeredBy}`)
    }

    const patientRef = await db.collection('patients').add(newPatient)
    
    // Create initial invoice
    await db.collection(`patients/${patientRef.id}/invoices`).add({
      status: 'pending',
      creationDate: admin.firestore.FieldValue.serverTimestamp(),
      totalAmount: 0,
      amountPaid: 0,
      balance: 0
    })

    // Create notification
    await db.collection('notifications').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: registeredBy,
      message: `New patient registered: ${patientInfo.name} ${patientInfo.surname} (${hospitalNumber})`,
      triggeredBy: 'patient_registration'
    })

    const createdPatientDoc = await patientRef.get();
    const createdPatientData = createdPatientDoc.data();

    // Convert Firestore Timestamps to ISO strings for JSON serialization
    const serializablePatient = {
      ...createdPatientData,
      id: createdPatientDoc.id,
      dob: createdPatientData.dob.toDate().toISOString(),
      registrationDate: createdPatientData.registrationDate.toDate().toISOString(),
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        patient: serializablePatient,
        message: 'Patient registered successfully'
      })
    }

  } catch (error) {
    console.error('Error creating patient:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to create patient', 
        details: error.message 
      })
    }
  }
}