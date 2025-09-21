import { db } from './lib/firebase-admin.js';
import admin from 'firebase-admin';

// Generate unique hospital number
const generateHospitalNumber = async () => {
  console.log('🔵 Starting generateHospitalNumber function');
  
  try {
    const prefix = 'MHS'
    const year = new Date().getFullYear().toString().slice(-2)
    console.log('🔵 Generated prefix and year:', { prefix, year });
    
    let isUnique = false
    let hospitalNumber = ''
    let attempts = 0
    
    while (!isUnique) {
      attempts++;
      console.log(`🔵 Attempt ${attempts} to generate unique hospital number`);
      
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      hospitalNumber = `${prefix}${year}${random}`
      console.log('🔵 Generated hospital number:', hospitalNumber);
      
      // Check if this number already exists
      console.log('🔵 Checking if hospital number exists in database');
      const existingPatient = await db.collection('patients')
        .where('hospitalNumber', '==', hospitalNumber)
        .limit(1)
        .get()
      
      console.log('🔵 Database query result - empty:', existingPatient.empty);
      
      if (existingPatient.empty) {
        isUnique = true
        console.log('✅ Unique hospital number found:', hospitalNumber);
      } else {
        console.log('⚠️ Hospital number already exists, generating new one');
      }
      
      if (attempts > 100) {
        throw new Error('Unable to generate unique hospital number after 100 attempts');
      }
    }
    
    console.log('✅ generateHospitalNumber completed successfully:', hospitalNumber);
    return hospitalNumber
  } catch (error) {
    console.error('❌ Error in generateHospitalNumber:', error);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}

// Calculate age from date of birth
const calculateAge = (dob) => {
  console.log('🔵 Starting calculateAge function with DOB:', dob);
  
  try {
    const today = new Date()
    const birthDate = new Date(dob)
    console.log('🔵 Today:', today);
    console.log('🔵 Birth date:', birthDate);
    
    if (isNaN(birthDate.getTime())) {
      throw new Error(`Invalid date format: ${dob}`);
    }
    
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    console.log('🔵 Initial age calculation:', age);
    console.log('🔵 Month difference:', monthDiff);

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
      console.log('🔵 Adjusted age (birthday not reached this year):', age);
    }

    console.log('✅ calculateAge completed successfully:', age);
    return age
  } catch (error) {
    console.error('❌ Error in calculateAge:', error);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}

export const handler = async (event, context) => {
  console.log('🚀 Function handler started');
  console.log('🔵 Event method:', event.httpMethod);
  console.log('🔵 Event headers:', JSON.stringify(event.headers, null, 2));
  console.log('🔵 Event body raw:', event.body);
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('❌ Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  let step = 'initializing';
  try {
    console.log('🔵 Step: initializing');
    
    step = 'checking_body_exists';
    console.log('🔵 Step: checking_body_exists');
    if (!event.body) {
      throw new Error('Request body is missing or empty');
    }
    
    step = 'parsing_body';
    console.log('🔵 Step: parsing_body');
    console.log('🔵 Raw body content:', event.body);
    
    let patientData;
    try {
      patientData = JSON.parse(event.body);
      console.log('✅ Successfully parsed JSON body');
      console.log('🔵 Parsed patient data:', JSON.stringify(patientData, null, 2));
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      throw new Error(`Invalid JSON format: ${parseError.message}`);
    }

    step = 'validating_required_fields';
    console.log('🔵 Step: validating_required_fields');
    const requiredFields = ['name', 'surname', 'dob', 'gender', 'phone', 'address', 'idNumber'];
    console.log('🔵 Required fields:', requiredFields);
    
    const missingFields = requiredFields.filter(field => {
      const exists = patientData[field] && patientData[field].toString().trim() !== '';
      console.log(`🔵 Field "${field}": ${exists ? '✅ present' : '❌ missing/empty'}, value:`, patientData[field]);
      return !exists;
    });
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          receivedFields: Object.keys(patientData),
          missingFields: missingFields
        })
      }
    }
    console.log('✅ All required fields are present');

    step = 'validating_date';
    console.log('🔵 Step: validating_date');
    console.log('🔵 DOB value:', patientData.dob);
    console.log('🔵 DOB type:', typeof patientData.dob);
    
    const dobDate = new Date(patientData.dob);
    console.log('🔵 Parsed DOB date object:', dobDate);
    console.log('🔵 DOB is valid:', !isNaN(dobDate.getTime()));
    
    if (isNaN(dobDate.getTime())) {
      console.log('❌ Invalid date format');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Invalid date of birth format',
          received: patientData.dob,
          expected: 'YYYY-MM-DD format'
        })
      }
    }
    console.log('✅ Date validation passed');

    step = 'checking_firebase_connection';
    console.log('🔵 Step: checking_firebase_connection');
    try {
      // Test Firebase connection
      console.log('🔵 Testing Firebase connection');
      const testQuery = await db.collection('patients').limit(1).get();
      console.log('✅ Firebase connection successful');
    } catch (firebaseError) {
      console.error('❌ Firebase connection error:', firebaseError);
      console.error('❌ Firebase error stack:', firebaseError.stack);
      throw new Error(`Firebase connection failed: ${firebaseError.message}`);
    }

    step = 'generating_hospital_number';
    console.log('🔵 Step: generating_hospital_number');
    const hospitalNumber = await generateHospitalNumber()
    console.log('✅ Hospital number generated:', hospitalNumber);
    
    step = 'calculating_age';
    console.log('🔵 Step: calculating_age');
    const age = calculateAge(patientData.dob)
    console.log('✅ Age calculated:', age);

    step = 'preparing_patient_document';
    console.log('🔵 Step: preparing_patient_document');
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
    console.log('✅ Patient document prepared');
    console.log('🔵 New patient object:', JSON.stringify(newPatient, null, 2));

    step = 'adding_patient_to_db';
    console.log('🔵 Step: adding_patient_to_db');
    let patientRef;
    try {
      patientRef = await db.collection('patients').add(newPatient)
      console.log('✅ Patient added to database with ID:', patientRef.id);
    } catch (dbError) {
      console.error('❌ Database add error:', dbError);
      console.error('❌ Database error stack:', dbError.stack);
      throw new Error(`Failed to add patient to database: ${dbError.message}`);
    }
    
    step = 'creating_invoice';
    console.log('🔵 Step: creating_invoice');
    try {
      const invoiceRef = await db.collection(`patients/${patientRef.id}/invoices`).add({
        status: 'pending',
        creationDate: admin.firestore.FieldValue.serverTimestamp(),
        totalAmount: 0,
        amountPaid: 0,
        balance: 0
      })
      console.log('✅ Invoice created with ID:', invoiceRef.id);
    } catch (invoiceError) {
      console.error('❌ Invoice creation error:', invoiceError);
      console.error('❌ Invoice error stack:', invoiceError.stack);
      throw new Error(`Failed to create invoice: ${invoiceError.message}`);
    }

    step = 'fetching_created_patient';
    console.log('🔵 Step: fetching_created_patient');
    let createdPatientDoc, createdPatientData;
    try {
      createdPatientDoc = await patientRef.get();
      createdPatientData = createdPatientDoc.data();
      console.log('✅ Patient document fetched');
      console.log('🔵 Created patient data:', JSON.stringify(createdPatientData, null, 2));
    } catch (fetchError) {
      console.error('❌ Fetch created patient error:', fetchError);
      console.error('❌ Fetch error stack:', fetchError.stack);
      throw new Error(`Failed to fetch created patient: ${fetchError.message}`);
    }

    step = 'serializing_response';
    console.log('🔵 Step: serializing_response');
    let serializablePatient;
    try {
      serializablePatient = {
        ...createdPatientData,
        id: createdPatientDoc.id,
        dob: createdPatientData.dob.toDate().toISOString(),
        registrationDate: createdPatientData.registrationDate.toDate().toISOString(),
      };
      console.log('✅ Response serialized');
      console.log('🔵 Serializable patient:', JSON.stringify(serializablePatient, null, 2));
    } catch (serializeError) {
      console.error('❌ Serialization error:', serializeError);
      console.error('❌ Serialize error stack:', serializeError.stack);
      throw new Error(`Failed to serialize response: ${serializeError.message}`);
    }

    step = 'returning_success';
    console.log('🔵 Step: returning_success');
    const successResponse = {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        patient: serializablePatient,
        message: 'Patient registered successfully'
      })
    }
    console.log('✅ Success response prepared');
    console.log('🔵 Final response:', JSON.stringify(successResponse, null, 2));
    
    console.log('🎉 Function completed successfully');
    return successResponse;

  } catch (error) {
    console.error('💥 CRITICAL ERROR OCCURRED');
    console.error('❌ Error at step:', step);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error name:', error.name);
    console.error('❌ Full error object:', error);
    console.error('❌ Error stack trace:', error.stack);
    
    // Additional context logging
    console.error('🔍 Additional Context:');
    console.error('  - Event method:', event.httpMethod);
    console.error('  - Event body length:', event.body ? event.body.length : 'null');
    console.error('  - Current step:', step);
    console.error('  - Timestamp:', new Date().toISOString());
    
    const errorResponse = {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to create patient', 
        details: `Failed at step: ${step}. Error: ${error.message}`,
        errorName: error.name,
        step: step,
        timestamp: new Date().toISOString()
      })
    }
    
    console.log('❌ Error response:', JSON.stringify(errorResponse, null, 2));
    return errorResponse;
  }
}
