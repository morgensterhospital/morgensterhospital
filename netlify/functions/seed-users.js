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
// HELPER FUNCTIONS FOR DELETION
// =================================================================

/**
 * Deletes all users from Firebase Authentication.
 * Handles pagination to ensure all users are removed.
 */
const deleteAllAuthUsers = async (nextPageToken) => {
  try {
    const listUsersResult = await auth.listUsers(1000, nextPageToken);
    const uids = listUsersResult.users.map(userRecord => userRecord.uid);

    if (uids.length > 0) {
      await auth.deleteUsers(uids);
      console.log(`- Deleted ${uids.length} auth users.`);
    }

    if (listUsersResult.pageToken) {
      await deleteAllAuthUsers(listUsersResult.pageToken);
    }
  } catch (error) {
    console.error('Error deleting auth users:', error);
  }
};

/**
 * Deletes all documents within a Firestore collection in batches.
 * @param {string} collectionPath - The path to the collection to delete.
 */
const deleteCollection = async (collectionPath) => {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(200); // Batches of 200

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });

  async function deleteQueryBatch(query, resolve, reject) {
    try {
      const snapshot = await query.get();
      if (snapshot.size === 0) {
        return resolve();
      }

      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();

      console.log(`- Deleted a batch of ${snapshot.size} documents from ${collectionPath}.`);
      
      process.nextTick(() => deleteQueryBatch(query, resolve, reject));
    } catch (error) {
      console.error(`Error deleting collection ${collectionPath}:`, error);
      reject(error);
    }
  }
};

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

// =================================================================
// MODIFIED createUser FUNCTION
// =================================================================
/**
 * Creates a user in Firebase Auth, adds them to the top-level 'users' collection,
 * and also adds them to their department's 'users' subcollection with empty fields.
 */
const createUser = async (email, password, role, department, wardType = null) => {
  // 1. Create the user in Firebase Authentication
  const userRecord = await auth.createUser({ email, password, displayName: role, emailVerified: true });
  
  // 2. Set custom claims for authorization
  await auth.setCustomUserClaims(userRecord.uid, { role, department, wardType, isActive: true });
  
  const batch = db.batch();

  // 3. Add user to the top-level 'users' collection for general queries
  const userRef = db.collection('users').doc(userRecord.uid);
  batch.set(userRef, {
    uid: userRecord.uid, email, fullName: role, role, department,
    wardType: wardType || null, isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(), lastLogin: null
  });

  // 4. Add user to the department's 'users' subcollection for departmental management
  const departmentId = department.toLowerCase().replace(/\s+/g, '-');
  const departmentUserRef = db.collection('departments').doc(departmentId).collection('users').doc(userRecord.uid);
  
  // Add user with specified empty fields for an admin to edit later
  batch.set(departmentUserRef, {
    uid: userRecord.uid,
    name: '',
    surname: '',
    'ID number': '',
    'Phone number': '',
    password: '' // Note: Storing passwords, even empty ones, in Firestore is not recommended.
  });

  // 5. Commit both writes at the same time
  await batch.commit();

  console.log(`   - Created: ${email} (${role}) and added to '${department}' department.`);
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
        if (error.code === 'auth/email-already-exists') {
          console.log(`   ⚠️  Skipping ${email}, user already exists.`);
        } else {
          console.error(`   ❌ Failed to create ${email}:`, error.message);
        }
      }
    }
  }
  console.log('✅ User seeding complete.');
};

const seedBillableItems = async () => {
  console.log('\n📦 Seeding billable items...');
 const billableItems = [
    { name: 'Levofloxacin 500mg IV', quantity: 150, description: 'Antibiotic.', price: 8.25 },
    { name: 'Heparin 5000 units/mL', quantity: 200, description: 'Anticoagulant.', price: 1.50 },
    { name: 'Dextrose 5% Solution', quantity: 1000, description: 'IV fluid.', price: 0.75 },
    // ... other items
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
// MAIN HANDLER
// =================================================================

export const handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  const seederStatusRef = db.collection('_internal').doc('seeder_status');

  try {
    const seederStatusDoc = await seederStatusRef.get();

    if (seederStatusDoc.exists) {
      const message = 'Database has already been seeded. To re-run, delete the `_internal/seeder_status` document in Firestore.';
      console.log(`⚠️  ${message}`);
      return {
        statusCode: 200, headers: corsHeaders,
        body: JSON.stringify({ message })
      };
    }

    console.log('🚀 First-time seed detected. Wiping existing data and seeding...');

    // 1. Delete all existing data to ensure a clean slate
    console.log('\n🔥 Cleaning existing data...');
    await deleteAllAuthUsers();
    await Promise.all([
      deleteCollection('users'),
      deleteCollection('departments'),
      deleteCollection('billable_items')
    ]);
    console.log('✅ Data cleaning complete.');

    // 2. Seed all the new data
    await seedDepartments();
    await seedUsers();
    await seedBillableItems();

    // 3. Create the flag document to prevent this from running again
    await seederStatusRef.set({
      completed: true,
      seededAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('\n🎉 Seeding process completed successfully!');
    console.log('✅ Status flag set. Seeder will not run again.');

    return {
      statusCode: 200, headers: corsHeaders,
      body: JSON.stringify({ message: 'Database was successfully wiped and seeded.' })
    };

  } catch (error) {
    console.error('❌ Seeding process failed:', error);
    return {
      statusCode: 500, headers: corsHeaders,
      body: JSON.stringify({ error: 'Seeding process failed', details: error.message })
    };
  }
};
