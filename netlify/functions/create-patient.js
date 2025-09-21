// file: functions/patientHandler.js
import { db } from './lib/firebase-admin.js'
import admin from 'firebase-admin'

// Generate unique hospital number
const generateHospitalNumber = async () => {
  const prefix = 'MHS'
  const year = new Date().getFullYear().toString().slice(-2)
  
  let isUnique = false
  let hospitalNumber = ''
  let attempts = 0
  
  while (!isUnique && attempts < 20) {
    attempts++
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    hospitalNumber = `${prefix}${year}${random}`
    
    const existingPatient = await db.collection('patients')
      .where('hospitalNumber', '==', hospitalNumber)
      .limit(1)
      .get()
    
    if (existingPatient.empty) {
      isUnique = true
    }
  }
  
  if (!isUnique) {
    throw new Error('Could not generate unique hospital number after multiple attempts')
  }
  
  return hospitalNumber
}

// Calculate age from date of birth
const calculateAge = (dob) => {
  const today = new Date()
  const birthDate = new Date(dob)
  if (isNaN(birthDate.getTime())) {
    throw new Error('Invalid date of birth')
  }
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export const handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let step = 'initializing'
  try {
    step = 'parsing_body'
    if (!event.body) throw new Error('Missing request body')
    const patientData = JSON.parse(event.body)
    const { registeredBy, ...patientInfo } = patientData

    if (!registeredBy) throw new Error('Missing registeredBy field')
    if (!patientInfo.dob) throw new Error('Missing date of birth (dob)')
    if (isNaN(new Date(patientInfo.dob).getTime())) throw new Error('Invalid date of birth format')

    step = 'generating_hospital_number'
    const hospitalNumber = await generateHospitalNumber()
    
    step = 'calculating_age'
    const age = calculateAge(patientInfo.dob)

    step = 'preparing_patient_document'
    const newPatient = {
      ...patientInfo,
      hospitalNumber,
      age,
      dob: admin.firestore.Timestamp.fromDate(new Date(patientInfo.dob)),
      registrationDate: admin.firestore.FieldValue.serverTimestamp(),
      registeredByRef: db.doc(`users/${registeredBy}`)
    }

    step = 'adding_patient_to_db'
    const patientRef = await db.collection('patients').add(newPatient)
    
    step = 'creating_invoice'
    await db.collection(`patients/${patientRef.id}/invoices`).add({
      status: 'pending',
      creationDate: admin.firestore.FieldValue.serverTimestamp(),
      totalAmount: 0,
      amountPaid: 0,
      balance: 0
    })

    step = 'creating_notification'
    await db.collection('notifications').add({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: registeredBy,
      message: `New patient registered: ${patientInfo.name || ''} ${patientInfo.surname || ''} (${hospitalNumber})`,
      triggeredBy: 'patient_registration'
    })

    step = 'fetching_created_patient'
    const createdPatientDoc = await patientRef.get()
    const createdPatientData = createdPatientDoc.data()

    if (!createdPatientData) throw new Error('Patient document not found after creation')

    step = 'serializing_response'
    const serializablePatient = {
      ...createdPatientData,
      id: createdPatientDoc.id,
      dob: createdPatientData.dob?.toDate().toISOString() || null,
      registrationDate: createdPatientData.registrationDate?.toDate().toISOString() || null
    }

    step = 'returning_success'
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
    console.error(`Error creating patient at step: ${step}`, error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to create patient', 
        details: `Failed at step: ${step}. Error: ${error.message}`
      })
    }
  }
}
