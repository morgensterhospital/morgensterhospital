import admin from 'firebase-admin'

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: "morgensterhospital-1088c",
      private_key_id: "79a3ebeb56f60989f1f603c3ea70926595d4ca12",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCHRT/+8n3NUPQ6\nhAGgT8EVpvZGrKJqzY1mPXqO9FatkfbW5kvKCnVxArBhd0bQsMifDxlQwFEZ27fp\niRvzsMslvIHxiu90YSuZjmtsXme6/nSQi2ibCBzcUaaDJG9SXlqFwMG6td/+n4Ep\nwkEhntSxLwIbW6yRvHrnYTaibPMH/lLM2wlL3qeK9ezf0Rlu/1sL47ylc6XZuBvz\n7hBUTfTJFP8BTPXNhTvvjJo3O8kAh23sgFLrW/6eZIcRomal+ci/22t0CfN/8gF2\nwa78Tndtr+BLXp09hbjVJnqb/iB3v5KJGosRtGoR5jpPedqfxsKkXxXtjLaANsHU\nM8DtjTl9AgMBAAECggEAJlbjV5BFRb8vKbKmf1h7gnaLEOb3NcxCynqcVQ49zv4y\n9x/Y1U/3j2tSsJ1M7fNdOW/fHfsUQX779m4NBRnTykNOlTZqvhKYd/Jc0h9DyUU7\npohMwrwe6fceeccG4lKp14UVo6TO8u0kf8B2E2BgKkQHldd65ueD8jakdI7qpxXt\nxxQTWGlLrA6myGoyxksZue4wRypE8VlMKB8j+IvI2dk0tvtDSqB4r6u1pajU4quH\nJ2HruZHBJZKmkkuWSasY3SbfLPOXGbGC278OJiTs0+7JVGeAyj578f/WgvfEhUs4\nLkAELAbgB2XsVoXgsp27iFMOMMuV5QcAyNo9XUViRQKBgQC6lb6TJk53rUJgSG3C\nAP3KmsddfVO/LI6hCPgXFqyO0J+dsNg4cyPJLlD1SXZ/y9AmrnjtiWUSTsWYrr7a\nX6g2BYD2O1bODohfB0H4xfUFYvvlc9UnI6WofeXHA5cfxZ8Ou6JTxz0g7ISqS3m+\nUZG6n/PTdVGUujqq0kRTJjqlIwKBgQC5mFhPjO7TmsybZGwv2tuYOmzXe3FdYr/4\n5JpuuPf4nZ7szIkM7n+q9KltUD/+OaFhlLPgNu4+jqmOGzFhZT11OynKDUoyJWWM\nJYS61x1wbmg3fmXDa9/JG+WU+XcCuI2QpBRjLAxrawIcwDtGBEZW5AJtStKPA7q1\n+IIQ4ZEg3wKBgHqTUWV+LuJ0UjzKmEBxQklNsVd7s/7NmM22BLW2UZpo99MykHlV\nOtc5tDnQDycZkB85U3xJXLrQQQNzGTKA0RLcPsKEbRxlc7VqIS77bWIiivVMSWWz\nB2tPehpqA2f9/eZB4fxD0abFesodV1duYtxFpHrwga3BQjVieTxeyvwdAoGBAKQ5\nuRMTSxV1Kc3qy4yA5cVLFZqLAaI3ylUru7dz9wBIQSOaTT9jHxcgDXfMBgQn7LRT\nB+PD14cFZ+V2DHj5Q6ujYXQH1HqQ+s1LOaq2xLcDCzbnopaMsuXayIjNQdDni2TM\nu7mRdZ/rfWABfbGUAMXMVpVtGuovy5xPvI/BeVETAoGBAKQ5\nuRMTSxV1Kc3qy4yA5cVLFZqLAaI3ylUru7dz9wBIQSOaTT9jHxcgDXfMBgQn7LRT\nB+PD14cFZ+V2DHj5Q6ujYXQH1HqQ+s1LOaq2xLcDCzbnopaMsuXayIjNQdDni2TM\nu7mRdZ/rfWABfbGUAMXMVpVtGuovy5xPvI/BeVETAoGAXdom8YpdlLLyk6kZz95X\nr+J7E5fZ+OuOIvJVAghH/FOM0EUB90XXAM7M76d3RCLO7hRsHp7NazBG0YpbEx1a\nE5rwlajrHrX8ZQXFqx+ZEQP7/K1hlUiQ0+19yj82re1IInkKRPiSlZcOEZRisIsE\nVsiyGVwkBlfdocO/G+/WEB0=\n",
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

const auth = admin.auth()
const db = admin.firestore()

// User roles and their counts
const userRoles = [
  { role: 'Admin', department: 'Administration', count: 1 },
  { role: 'Doctor', department: 'Clinical', count: 5 },
  { role: 'Accountant', department: 'Accounting', count: 1 },
  { role: 'Account Assistant', department: 'Accounting', count: 3 },
  { role: 'Accounts Clerk', department: 'Accounting', count: 5 },
  { role: 'Vitals Checker', department: 'Clinical', count: 4 },
  { role: 'Nurse', department: 'OPD', count: 10, wardType: 'OPD' },
  { role: 'Nurse', department: 'FCH Ward', count: 12, wardType: 'FCH' },
  { role: 'Nurse', department: 'Maternity', count: 30, wardType: 'Maternity' },
  { role: 'Nurse', department: 'Theatre Ward', count: 15, wardType: 'Theatre' },
  { role: 'Nurse', department: 'Female Ward', count: 20, wardType: 'Female' },
  { role: 'Nurse', department: 'Male Ward', count: 20, wardType: 'Male' },
  { role: 'Nurse', department: 'Children Ward', count: 20, wardType: 'Children' },
  { role: 'Laboratory Technician', department: 'Laboratory', count: 4 },
  { role: 'Pharmacy Technician', department: 'Pharmacy', count: 2 },
  { role: 'Dispensary Assistant', department: 'Pharmacy', count: 5 },
  { role: 'Radiologist', department: 'Radiology', count: 2 },
  { role: 'Rehabilitation Technician', department: 'Rehabilitation', count: 3 }
]

const createUser = async (email, password, role, department, wardType = null) => {
  try {
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${role} User`,
      emailVerified: true
    })

    // Set custom claims for role-based access
    await auth.setCustomUserClaims(userRecord.uid, {
      role,
      department,
      wardType,
      isActive: true
    })

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      fullName: `${role} User`,
      role,
      department,
      wardType: wardType || null,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null
    })

    console.log(`✅ Created user: ${email} (${role})`)
    return userRecord
  } catch (error) {
    console.error(`❌ Failed to create user ${email}:`, error.message)
    throw error
  }
}

const seedUsers = async () => {
  console.log('🚀 Starting user seeding process...')
  console.log('📊 Total users to create:', userRoles.reduce((sum, r) => sum + r.count, 0))

  let totalCreated = 0
  const defaultPassword = 'mhs2025'

  try {
    for (const roleConfig of userRoles) {
      const { role, department, count, wardType } = roleConfig
      
      console.log(`\n📝 Creating ${count} ${role}(s) in ${department}...`)
      
      for (let i = 1; i <= count; i++) {
        const emailPrefix = role.toLowerCase().replace(/\s+/g, '').replace(/'/g, '')
        let email
        
        if (count === 1) {
          email = `${emailPrefix}@mhs.com`
        } else {
          email = `${emailPrefix}${i}@mhs.com`
        }

        try {
          await createUser(email, defaultPassword, role, department, wardType)
          totalCreated++
        } catch (error) {
          if (error.code === 'auth/email-already-exists') {
            console.log(`⚠️  User ${email} already exists, skipping...`)
          } else {
            console.error(`❌ Failed to create ${email}:`, error.message)
          }
        }
      }
    }

    // Create app configuration documents
    console.log('\n🏥 Setting up application configuration...')
    
    // Initialize price list
    await db.collection('app_config').doc('price_list').set({
      items: [
        { id: 'consultation', name: 'Doctor Consultation', price: 150.00 },
        { id: 'xray_chest', name: 'Chest X-Ray', price: 300.00 },
        { id: 'blood_test_full', name: 'Full Blood Count', price: 200.00 },
        { id: 'urine_test', name: 'Urine Analysis', price: 100.00 },
        { id: 'ecg', name: 'ECG', price: 250.00 },
        { id: 'ultrasound', name: 'Ultrasound', price: 400.00 },
        { id: 'vaccination', name: 'Vaccination', price: 80.00 },
        { id: 'dressing', name: 'Wound Dressing', price: 50.00 },
        { id: 'injection', name: 'Injection', price: 30.00 },
        { id: 'admission_fee', name: 'Admission Fee', price: 500.00 }
      ],
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    })

    // Initialize inventory
    await db.collection('app_config').doc('inventory').set({
      items: [
        { id: 'paracetamol', name: 'Paracetamol 500mg', stockLevel: 1000, unit: 'tablets', category: 'medication', minimumLevel: 100 },
        { id: 'amoxicillin', name: 'Amoxicillin 250mg', stockLevel: 500, unit: 'capsules', category: 'medication', minimumLevel: 50 },
        { id: 'ibuprofen', name: 'Ibuprofen 200mg', stockLevel: 750, unit: 'tablets', category: 'medication', minimumLevel: 75 },
        { id: 'bandages', name: 'Elastic Bandages', stockLevel: 200, unit: 'rolls', category: 'supplies', minimumLevel: 20 },
        { id: 'syringes', name: 'Disposable Syringes', stockLevel: 2000, unit: 'pieces', category: 'supplies', minimumLevel: 200 },
        { id: 'gloves', name: 'Medical Gloves', stockLevel: 500, unit: 'boxes', category: 'supplies', minimumLevel: 50 },
        { id: 'masks', name: 'Surgical Masks', stockLevel: 1000, unit: 'pieces', category: 'supplies', minimumLevel: 100 },
        { id: 'antiseptic', name: 'Antiseptic Solution', stockLevel: 100, unit: 'bottles', category: 'supplies', minimumLevel: 10 }
      ],
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    })

    console.log('✅ Application configuration created')

    console.log('\n🎉 User seeding completed successfully!')
    console.log(`📈 Total users created: ${totalCreated}`)
    console.log('\n📋 Summary by role:')
    
    userRoles.forEach(roleConfig => {
      const { role, department, count, wardType } = roleConfig
      const dept = wardType ? `${department} (${wardType})` : department
      console.log(`   ${role}: ${count} users in ${dept}`)
    })

    console.log('\n🔐 Login credentials:')
    console.log('   Default password for all users: mhs2025')
    console.log('\n📧 Sample login emails:')
    console.log('   Admin: admin@mhs.com')
    console.log('   Doctor: doctor1@mhs.com - doctor5@mhs.com')
    console.log('   Accounts Clerk: accountsclerk1@mhs.com - accountsclerk5@mhs.com')
    console.log('   Nurse: nurse1@mhs.com - nurse10@mhs.com (OPD)')
    console.log('   Lab Technician: laboratorytechnician1@mhs.com - laboratorytechnician4@mhs.com')
    console.log('\n✨ System is ready for use!')

  } catch (error) {
    console.error('❌ Seeding process failed:', error)
    process.exit(1)
  }
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
    // Check if users already exist
    const existingUsers = await db.collection('users').limit(1).get()
    if (!existingUsers.empty) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          message: 'Users already seeded',
          totalUsers: userRoles.reduce((sum, r) => sum + r.count, 0)
        })
      }
    }

    await seedUsers()

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'User seeding completed successfully!',
        totalCreated: userRoles.reduce((sum, r) => sum + r.count, 0)
      })
    }

  } catch (error) {
    console.error('Seeding process failed:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Seeding process failed', 
        details: error.message 
      })
    }
  }
}