import { db } from './lib/firebase-admin.js';
import admin from 'firebase-admin';

const auth = admin.auth();


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

    // Seed billable items
    console.log('\n📦 Seeding billable items...');
    const billableItems = [
      { name: 'Levofloxacin 500mg IV', quantity: 150, description: 'Fluoroquinolone antibiotic for severe bacterial infections.', price: 8.25 },
      { name: 'Heparin 5000 units/mL', quantity: 200, description: 'Anticoagulant to prevent blood clots.', price: 1.50 },
      { name: 'Dextrose 5% Solution', quantity: 1000, description: 'Intravenous fluid for hydration and providing calories.', price: 0.75 },
      { name: 'Lidocaine 2%', quantity: 500, description: 'Local anesthetic for minor procedures and pain relief.', price: 0.90 },
      { name: 'Insulin Aspart (Novolog)', quantity: 50, description: 'Rapid-acting insulin for managing blood sugar levels.', price: 25.00 },
      { name: 'Cefepime 1g IV', quantity: 125, description: 'Fourth-generation cephalosporin antibiotic.', price: 12.00 },
      { name: 'Lorazepam 2mg tablets', quantity: 1000, description: 'Benzodiazepine used to treat anxiety and seizures.', price: 0.50 },
      { name: 'Pantoprazole 40mg IV', quantity: 100, description: 'Proton pump inhibitor for severe acid reflux and ulcers.', price: 4.75 },
      { name: 'Ondansetron 4mg IV', quantity: 300, description: 'Anti-emetic used to prevent nausea and vomiting.', price: 3.50 },
      { name: 'Epinephrine 1mg/mL', quantity: 250, description: 'Adrenergic agonist for anaphylaxis and cardiac arrest.', price: 1.80 },
    ];

    const batch = db.batch();
    billableItems.forEach((item, index) => {
      const id = `item-${String(index + 1).padStart(3, '0')}`;
      const docRef = db.collection('billable_items').doc(id);
      batch.set(docRef, { ...item, id });
    });
    await batch.commit();
    console.log(`✅ Seeded ${billableItems.length} billable items.`);

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
