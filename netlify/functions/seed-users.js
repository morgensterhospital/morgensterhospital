import { admin, db } from './lib/firebase-admin.js';

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
};

const seedUsers = async () => {
  console.log('\n🚀 Seeding users...');
  const defaultPassword = 'mhs2025';

  for (const roleConfig of userRoles) {
    const { role, department, count, wardType } = roleConfig;
    for (let i = 1; i <= count; i++) {
      const emailPrefix = role.toLowerCase().replace(/\s+/g, '').replace(/'/g, '');
      const email = (count === 1) ? `${emailPrefix}@mhs.com` : `${emailPrefix}${i}@mhs.com`;
      try {
        await createUser(email, defaultPassword, role, department, wardType);
      } catch (error) {
        // Safely skip users that already exist in Firebase Auth
        if (error.code === 'auth/email-already-exists') {
          console.log(`   ⚠️  Skipping ${email}, user already exists in Auth.`);
        } else {
          console.error(`   ❌ Failed to create ${email}:`, error.message);
        }
      }
    }
  }
  console.log('✅ User seeding complete.');
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


// Helper to calculate age from date of birth
const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper to generate a unique hospital number
const generateHospitalNumber = async () => {
  const prefix = 'MHS';
  const year = new Date().getFullYear().toString().slice(-2);
  let isUnique = false;
  let hospitalNumber = '';
  while (!isUnique) {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    hospitalNumber = `${prefix}${year}${random}`;
    const existingPatient = await db.collection('patients').where('hospitalNumber', '==', hospitalNumber).limit(1).get();
    if (existingPatient.empty) {
      isUnique = true;
    }
  }
  return hospitalNumber;
};

const seedPatients = async () => {
  console.log('\n- Seeding 10 sample patients...');

  // Clear existing patients to avoid duplicates on re-seeding
  console.log('- Deleting existing patients...');
  const snapshot = await db.collection('patients').get();
  if (!snapshot.empty) {
    const deleteBatch = db.batch();
    snapshot.docs.forEach(doc => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();
    console.log(`- Deleted ${snapshot.size} existing patients.`);
  } else {
      console.log('- No existing patients to delete.');
  }

  const samplePatients = [
    { name: 'John', surname: 'Doe', dob: '1985-05-15', gender: 'Male', phone: '+1234567890', address: '123 Main St, Anytown', countryOfBirth: 'USA', maritalStatus: 'Married', idNumber: '123456789', nokName: 'Jane', nokSurname: 'Doe', nokPhone: '+1987654321', nokAddress: '123 Main St, Anytown' },
    { name: 'Alice', surname: 'Smith', dob: '1992-08-21', gender: 'Female', phone: '+1122334455', address: '456 Oak Ave, Somecity', countryOfBirth: 'Canada', maritalStatus: 'Single', idNumber: '987654321', nokName: 'Bob', nokSurname: 'Smith', nokPhone: '+1544332211', nokAddress: '456 Oak Ave, Somecity' },
    { name: 'Mohammed', surname: 'Ali', dob: '1978-11-30', gender: 'Male', phone: '+442079460958', address: '789 Pine Ln, Otherville', countryOfBirth: 'UK', maritalStatus: 'Married', idNumber: 'A1B2C3D4E', nokName: 'Fatima', nokSurname: 'Ali', nokPhone: '+442079460959', nokAddress: '789 Pine Ln, Otherville' },
    { name: 'Maria', surname: 'Garcia', dob: '2001-02-10', gender: 'Female', phone: '+34911235432', address: '101 Maple Dr, Anotherton', countryOfBirth: 'Spain', maritalStatus: 'Single', idNumber: 'Z9Y8X7W6V', nokName: 'Jose', nokSurname: 'Garcia', nokPhone: '+34911235433', nokAddress: '101 Maple Dr, Anotherton' },
    { name: 'Chen', surname: 'Wei', dob: '1995-07-19', gender: 'Male', phone: '+861012345678', address: '212 Birch Rd, Sometown', countryOfBirth: 'China', maritalStatus: 'Single', idNumber: 'G1H2I3J4K', nokName: 'Li', nokSurname: 'Wei', nokPhone: '+861012345679', nokAddress: '212 Birch Rd, Sometown' },
    { name: 'Fatima', surname: 'Khan', dob: '1988-09-05', gender: 'Female', phone: '+923001234567', address: '333 Cedar Blvd, Newplace', countryOfBirth: 'Pakistan', maritalStatus: 'Married', idNumber: 'L5M6N7O8P', nokName: 'Ahmed', nokSurname: 'Khan', nokPhone: '+923001234568', nokAddress: '333 Cedar Blvd, Newplace' },
    { name: 'David', surname: 'Goldstein', dob: '1965-03-25', gender: 'Male', phone: '+972501234567', address: '444 Spruce Way, Oldtown', countryOfBirth: 'Israel', maritalStatus: 'Widowed', idNumber: 'Q9R8S7T6U', nokName: 'Sarah', nokSurname: 'Goldstein', nokPhone: '+972501234568', nokAddress: '444 Spruce Way, Oldtown' },
    { name: 'Anya', surname: 'Petrov', dob: '2005-12-12', gender: 'Female', phone: '+74951234567', address: '555 Willow Ct, Anyplace', countryOfBirth: 'Russia', maritalStatus: 'Single', idNumber: 'V1W2X3Y4Z', nokName: 'Mikhail', nokSurname: 'Petrov', nokPhone: '+74951234568', nokAddress: '555 Willow Ct, Anyplace' },
    { name: 'Tariq', surname: 'Al-Jamil', dob: '1999-10-08', gender: 'Male', phone: '+966501234567', address: '666 Aspen Ave, Yourtown', countryOfBirth: 'Saudi Arabia', maritalStatus: 'Single', idNumber: 'A1B2C3D4F', nokName: 'Layla', nokSurname: 'Al-Jamil', nokPhone: '+966501234568', nokAddress: '666 Aspen Ave, Yourtown' },
    { name: 'Chika', surname: 'Okoro', dob: '1972-01-20', gender: 'Female', phone: '+2348012345678', address: '777 Redwood Pl, Herville', countryOfBirth: 'Nigeria', maritalStatus: 'Divorced', idNumber: 'G5H6I7J8K', nokName: 'Emeka', nokSurname: 'Okoro', nokPhone: '+2348012345679', nokAddress: '777 Redwood Pl, Herville' }
  ];

  const batch = db.batch();
  for (const patientData of samplePatients) {
    const hospitalNumber = await generateHospitalNumber();
    const age = calculateAge(patientData.dob);
    const newPatient = {
      ...patientData,
      hospitalNumber,
      age,
      dob: admin.firestore.Timestamp.fromDate(new Date(patientData.dob)),
      registrationDate: admin.firestore.FieldValue.serverTimestamp(),
    };
    const patientRef = db.collection('patients').doc();
    batch.set(patientRef, newPatient);
  }
  await batch.commit();
  console.log(' - Seeded 10 patients.');
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
    await seedUsers();
    await seedBillableItems();
    await seedPatients();

    console.log('\n🎉 Seeding process completed successfully!');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'Database was successfully seeded.' })
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
