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
];

// =================================================================
// SEEDING FUNCTIONS
// =================================================================

const seedDepartments = async () => {
  console.log('\n🏢 Seeding departments...');
  const departmentNames = [...new Set(userRoles.map(role => role.department))];
  const batch = db.batch();
  departmentNames.forEach(name => {
    const departmentId = name.toLowerCase().replace(/\s+/g, '-');
    const docRef = db.collection('departments').doc(departmentId);
    batch.set(docRef, { id: departmentId, name, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  await batch.commit();
  console.log(`✅ Seeded ${departmentNames.length} departments.`);
};

/**
 * Creates a user in Firebase Auth, adds them to the top-level 'users' collection,
 * and also adds them to their department's 'users' subcollection with empty fields for an admin.
 */
const createUser = async (email, password, role, department, wardType = null) => {
  // 1. Create the user in Firebase Authentication
  const userRecord = await auth.createUser({ email, password, displayName: role, emailVerified: true });
  
  // 2. Set custom claims for authorization roles
  await auth.setCustomUserClaims(userRecord.uid, { role, department, wardType, isActive: true });
  
  const batch = db.batch();

  // 3. Create a document in the main 'users' collection
  const userRef = db.collection('users').doc(userRecord.uid);
  batch.set(userRef, {
    uid: userRecord.uid, email, fullName: role, role, department,
    wardType: wardType || null, isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(), lastLogin: null
  });

  // 4. Create a document in the department's 'users' subcollection
  const departmentId = department.toLowerCase().replace(/\s+/g, '-');
  const departmentUserRef = db.collection('departments').doc(departmentId).collection('users').doc(userRecord.uid);
  
  // This document contains the fields for an admin to edit
  batch.set(departmentUserRef, {
    uid: userRecord.uid,
    name: '',
    surname: '',
    'ID number': '',
    'Phone number': '',
    password: '' // Note: Storing passwords in Firestore is highly discouraged.
                 // This is likely a placeholder for a reset mechanism.
  });

  // 5. Commit both writes atomically
  await batch.commit();

  console.log(`   - Created: ${email} (${role}) and added to '${department}' department's user list.`);
  return userRecord;
};

const seedUsers = async () => {
  console.log('\n🚀 Seeding users...');
  const defaultPassword = 'mhs2025';
  const createdUsers = [];

  for (const roleConfig of userRoles) {
    const { role, department, count, wardType } = roleConfig;
    for (let i = 1; i <= count; i++) {
      const emailPrefix = role.toLowerCase().replace(/\s+/g, '').replace(/'/g, '');
      const email = (count === 1) ? `${emailPrefix}@mhs.com` : `${emailPrefix}${i}@mhs.com`;
      try {
        const userRecord = await createUser(email, defaultPassword, role, department, wardType);
        createdUsers.push({ email: userRecord.email, uid: userRecord.uid });
      } catch (error) {
        // Safely skip users that already exist in Firebase Auth
        if (error.code === 'auth/email-already-exists') {
          console.log(`   ⚠️  Skipping ${email}, user already exists in Auth.`);
        } else {
          // Re-throw the error to be caught by the main handler
          throw new Error(`Failed to create user ${email}: ${error.message}`);
        }
      }
    }
  }
  console.log('✅ User seeding complete.');
  return createdUsers;
};

const seedBillableItems = async () => {
  console.log('\n📦 Seeding 10 billable items...');
  const billableItems = [
    { name: 'Consultation Fee', quantity: 9999, description: 'Standard patient consultation.', price: 50.00 },
    { name: 'Full Blood Count', quantity: 9999, description: 'Laboratory test.', price: 15.50 },
    { name: 'Urinalysis', quantity: 9999, description: 'Standard urine test.', price: 10.00 },
    { name: 'IV Drip Administration', quantity: 9999, description: 'Service fee for administering an IV.', price: 25.00 },
    { name: 'Paracetamol 500mg', quantity: 1000, description: 'Pain and fever relief.', price: 0.50 },
    { name: 'Amoxicillin 250mg', quantity: 500, description: 'Antibiotic.', price: 0.60 },
    { name: 'Wound Dressing (Small)', quantity: 9999, description: 'Minor wound care.', price: 7.75 },
    { name: 'X-Ray (Chest)', quantity: 9999, description: 'Standard chest radiograph.', price: 75.00 },
    { name: 'General Ward Bed Day', quantity: 9999, description: 'Fee per day in a general ward.', price: 120.00 },
    { name: 'Dextrose 5% Solution', quantity: 1000, description: 'IV fluid.', price: 0.75 }
  ];

  const batch = db.batch();
  billableItems.forEach((item, index) => {
    const id = `item-${String(index + 1).padStart(3, '0')}`;
    const docRef = db.collection('billable_items').doc(id);
    batch.set(docRef, { ...item, id });
  });
  await batch.commit();
  console.log(`✅ Seeded ${billableItems.length} billable items.`);
};


// =================================================================
// SIMPLIFIED HANDLER - SEED ONLY
// =================================================================

export const handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    console.log('🚀 Starting database seeding process...');

    // Sequentially seed data
    await seedDepartments();
    const createdUsers = await seedUsers();
    await seedBillableItems();

    console.log('\n🎉 Seeding process completed successfully!');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Database was successfully seeded.',
        created_users: createdUsers
      })
    };

  } catch (error) {
    console.error('❌ Seeding process failed:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Seeding process failed', details: error.message })
    };
  }
};
