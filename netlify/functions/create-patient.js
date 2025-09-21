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

  let step = 'initializing';
  try {
    step = 'parsing_body';
    const patientData = JSON.parse(event.body)

    // Validate required fields
    const requiredFields = ['name', 'surname', 'dob', 'gender', 'phone', 'address', 'idNumber'];
    const missingFields = requiredFields.filter(field => !patientData[field]);
    
    if (missingFields.length > 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        })
      }
    }

    step = 'validating_date';
    const dobDate = new Date(patientData.dob);
    if (isNaN(dobDate.getTime())) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Invalid date of birth format' 
        })
      }
    }

    step = 'generating_hospital_number';
    const hospitalNumber = await generateHospitalNumber()
    
    step = 'calculating_age';
    const age = calculateAge(patientData.dob)

    step = 'preparing_patient_document';
    const newPatient = {
      name: patientData.name,
      surname: patientData.surname,
      dob: admin.firestore.Timestamp.fromDate(new Date(patientData.dob)),
      age,
      gender: patientData.gender,
      phone: patientData.phone,
      address: patientData.address,
      idNumber: patientData.idNumber,
      maritalStatus: patientData.maritalStatus || '',
      countryOfBirth: patientData.countryOfBirth || '',
      nokName: patientData.nokName || '',
      nokSurname: patientData.nokSurname || '',
      nokPhone: patientData.nokPhone || '',
      nokAddress: patientData.nokAddress || '',
      hospitalNumber,
      registrationDate: admin.firestore.FieldValue.serverTimestamp()
    }

    step = 'adding_patient_to_db';
    const patientRef = await db.collection('patients').add(newPatient)
    
    step = 'creating_invoice';
    await db.collection(`patients/${patientRef.id}/invoices`).add({
      status: 'pending',
      creationDate: admin.firestore.FieldValue.serverTimestamp(),
      totalAmount: 0,
      amountPaid: 0,
      balance: 0
    })

    step = 'fetching_created_patient';
    const createdPatientDoc = await patientRef.get();
    const createdPatientData = createdPatientDoc.data();

    step = 'serializing_response';
    const serializablePatient = {
      ...createdPatientData,
      id: createdPatientDoc.id,
      dob: createdPatientData.dob.toDate().toISOString(),
      registrationDate: createdPatientData.registrationDate.toDate().toISOString(),
    };

    step = 'returning_success';
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
