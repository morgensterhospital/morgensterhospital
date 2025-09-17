import { db } from './lib/firebase-admin.js';
import admin from 'firebase-admin';

const auth = admin.auth();

const departments = [
  { name: 'Admin' },
  { name: 'Doctors Department' },
  { name: 'Accounts Department' },
  { name: 'OPD Department' },
  { name: 'FCH Ward Department' },
  { name: 'Laboratory Department' },
  { name: 'Pharmacy Department' },
  { name: 'Radiology Department' },
  { name: 'Martenity Ward Department' },
  { name: 'Theatre Ward Department' },
  { name: 'Female Ward Department' },
  { name: 'Male Ward Department' },
  { name: 'Children’s Ward Department' },
  { name: 'Rehabilitation ward Department' },
];

const defaultPassword = process.env.DEFAULT_PASSWORD || 'mhs2025';

const users = [
  { email: 'admin@mhs.com', role: 'Admin', department: 'Admin' },
  { email: 'doctor1@mhs.com', role: 'Doctor', department: 'Doctors Department' },
  { email: 'doctor2@mhs.com', role: 'Doctor', department: 'Doctors Department' },
  { email: 'doctor3@mhs.com', role: 'Doctor', department: 'Doctors Department' },
  { email: 'doctor4@mhs.com', role: 'Doctor', department: 'Doctors Department' },
  { email: 'doctor5@mhs.com', role: 'Doctor', department: 'Doctors Department' },
  { email: 'accountant1@mhs.com', role: 'Accountant', department: 'Accounts Department' },
  { email: 'accountassistant1@mhs.com', role: 'Account Assistant', department: 'Accounts Department' },
  { email: 'accountassistant2@mhs.com', role: 'Account Assistant', department: 'Accounts Department' },
  { email: 'accountassistant3@mhs.com', role: 'Account Assistant', department: 'Accounts Department' },
  { email: 'accountsclerk1@mhs.com', role: 'Accounts Clerk', department: 'Accounts Department' },
  { email: 'accountsclerk2@mhs.com', role: 'Accounts Clerk', department: 'Accounts Department' },
  { email: 'accountsclerk3@mhs.com', role: 'Accounts Clerk', department: 'Accounts Department' },
  { email: 'accountsclerk4@mhs.com', role: 'Accounts Clerk', department: 'Accounts Department' },
  { email: 'accountsclerk5@mhs.com', role: 'Accounts Clerk', department: 'Accounts Department' },
  { email: 'vitalschecker1@mhs.com', role: 'Vitals Checker', department: 'OPD Department' },
  { email: 'vitalschecker2@mhs.com', role: 'Vitals Checker', department: 'OPD Department' },
  { email: 'vitalschecker3@mhs.com', role: 'Vitals Checker', department: 'OPD Department' },
  { email: 'vitalschecker4@mhs.com', role: 'Vitals Checker', department: 'OPD Department' },
  { email: 'nurse1@mhs.com', role: 'Nurse', department: 'OPD Department' },
  { email: 'nurse2@mhs.com', role: 'Nurse', department: 'OPD Department' },
  { email: 'nurse3@mhs.com', role: 'Nurse', department: 'OPD Department' },
  { email: 'nurse4@mhs.com', role: 'Nurse', department: 'OPD Department' },
  { email: 'nurse5@mhs.com', role: 'Nurse', department: 'OPD Department' },
  { email: 'nurse6@mhs.com', role: 'Nurse', department: 'OPD Department' },
  { email: 'nurse7@mhs.com', role: 'Nurse', department: 'OPD Department' },
  { email: 'nurse8@mhs.com', role: 'Nurse', department: 'OPD Department' },
  { email: 'nurse9@mhs.com', role: 'Nurse', department: 'OPD Department' },
  { email: 'nurse10@mhs.com', role: 'Nurse', department: 'OPD Department' },
  { email: 'nurse11@mhs.com', role: 'Nurse', department: 'FCH Ward Department' },
  { email: 'nurse12@mhs.com', role: 'Nurse', department: 'FCH Ward Department' },
  { email: 'nurse13@mhs.com', role: 'Nurse', department: 'FCH Ward Department' },
  { email: 'nurse14@mhs.com', role: 'Nurse', department: 'FCH Ward Department' },
  { email: 'nurse15@mhs.com', role: 'Nurse', department: 'FCH Ward Department' },
  { email: 'nurse16@mhs.com', role: 'Nurse', department: 'FCH Ward Department' },
  { email: 'nurse17@mhs.com', role: 'Nurse', department: 'FCH Ward Department' },
  { email: 'nurse18@mhs.com', role: 'Nurse', department: 'FCH Ward Department' },
  { email: 'nurse19@mhs.com', role: 'Nurse', department: 'FCH Ward Department' },
  { email: 'nurse20@mhs.com', role: 'Nurse', department: 'FCH Ward Department' },
  { email: 'nurse21@mhs.com', role: 'Nurse', department: 'FCH Ward Department' },
  { email: 'nurse22@mhs.com', role: 'Nurse', department: 'FCH Ward Department' },
  { email: 'labtech1@mhs.com', role: 'Laboratory Technician', department: 'Laboratory Department' },
  { email: 'labtech2@mhs.com', role: 'Laboratory Technician', department: 'Laboratory Department' },
  { email: 'labtech3@mhs.com', role: 'Laboratory Technician', department: 'Laboratory Department' },
  { email: 'labtech4@mhs.com', role: 'Laboratory Technician', department: 'Laboratory Department' },
  { email: 'pharmtech1@mhs.com', role: 'Pharmacy Technician', department: 'Pharmacy Department' },
  { email: 'pharmtech2@mhs.com', role: 'Pharmacy Technician', department: 'Pharmacy Department' },
  { email: 'dispensaryassistant1@mhs.com', role: 'Dispensary Assistant', department: 'Pharmacy Department' },
  { email: 'dispensaryassistant2@mhs.com', role: 'Dispensary Assistant', department: 'Pharmacy Department' },
  { email: 'dispensaryassistant3@mhs.com', role: 'Dispensary Assistant', department: 'Pharmacy Department' },
  { email: 'dispensaryassistant4@mhs.com', role: 'Dispensary Assistant', department: 'Pharmacy Department' },
  { email: 'dispensaryassistant5@mhs.com', role: 'Dispensary Assistant', department: 'Pharmacy Department' },
  { email: 'radiologist1@mhs.com', role: 'Radiologist', department: 'Radiology Department' },
  { email: 'radiologist2@mhs.com', role: 'Radiologist', department: 'Radiology Department' },
  { email: 'rehabtech1@mhs.com', role: 'Rehabilitation Technician', department: 'Rehabilitation ward Department' },
  { email: 'rehabtech2@mhs.com', role: 'Rehabilitation Technician', department: 'Rehabilitation ward Department' },
  { email: 'rehabtech3@mhs.com', role: 'Rehabilitation Technician', department: 'Rehabilitation ward Department' },
];

const seedDepartments = async () => {
  console.log('📦 Seeding departments...');
  const batch = db.batch();
  departments.forEach((dept) => {
    const userCount = users.filter(user => user.department === dept.name).length;
    const docRef = db.collection('departments').doc();
    batch.set(docRef, { ...dept, userCount });
  });
  await batch.commit();
  console.log(`✅ Seeded ${departments.length} departments.`);
};

const seedUsers = async () => {
  console.log('🚀 Starting user seeding process...');
  let totalCreated = 0;

  for (const user of users) {
    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: user.email,
        password: defaultPassword,
        displayName: `${user.role} User`,
        emailVerified: true,
      });

      // Set custom claims for role-based access
      await auth.setCustomUserClaims(userRecord.uid, {
        role: user.role,
        department: user.department,
        isActive: true,
      });

      // Create user document in Firestore
      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: user.email,
        name: user.role,
        surname: 'User',
        fullName: `${user.role} User`,
        role: user.role,
        department: user.department,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: null,
      });

      console.log(`✅ Created user: ${user.email} (${user.role})`);
      totalCreated++;
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️  User ${user.email} already exists, skipping...`);
      } else {
        console.error(`❌ Failed to create ${user.email}:`, error.message);
      }
    }
  }

  console.log('\n🎉 User seeding completed successfully!');
  console.log(`📈 Total users created: ${totalCreated}`);
};

export const handler = async (event, context) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Check if departments already exist
    const departmentsSnapshot = await db.collection('departments').limit(1).get();
    if (departmentsSnapshot.empty) {
      await seedDepartments();
    } else {
      console.log('Departments collection already exists, skipping department seeding.');
    }

    // Check if users already exist
    const usersSnapshot = await db.collection('users').limit(1).get();
    if (usersSnapshot.empty) {
      await seedUsers();
    } else {
      console.log('Users collection already exists, skipping user seeding.');
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Seeding process checked. Database appears to be populated.',
      }),
    };
  } catch (error) {
    console.error('Seeding process failed:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Seeding process failed',
        details: error.message,
      }),
    };
  }
};
