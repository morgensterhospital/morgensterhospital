const admin = require('firebase-admin')
const serviceAccount = require('./serviceAccountKey.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'morgensterhospital-1088c'
})

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
        { id: 'paracetamol', name: 'Paracetamol 500mg', stockLevel: 1000, unit: 'tablets' },
        { id: 'amoxicillin', name: 'Amoxicillin 250mg', stockLevel: 500, unit: 'capsules' },
        { id: 'ibuprofen', name: 'Ibuprofen 200mg', stockLevel: 750, unit: 'tablets' },
        { id: 'bandages', name: 'Elastic Bandages', stockLevel: 200, unit: 'rolls' },
        { id: 'syringes', name: 'Disposable Syringes', stockLevel: 2000, unit: 'pieces' },
        { id: 'gloves', name: 'Medical Gloves', stockLevel: 500, unit: 'boxes' },
        { id: 'masks', name: 'Surgical Masks', stockLevel: 1000, unit: 'pieces' },
        { id: 'antiseptic', name: 'Antiseptic Solution', stockLevel: 100, unit: 'bottles' }
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

// Run the seeding process
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('\n🔚 Seeding process completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error)
      process.exit(1)
    })
}

module.exports = { seedUsers, createUser }