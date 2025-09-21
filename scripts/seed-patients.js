/**
 * To run this script:
 * 1. Make sure you have a `.env` file in the root of the project.
 * 2. Add the `FIREBASE_PRIVATE_KEY` to your `.env` file. You can get this from your Firebase project settings.
 *    The key should be wrapped in quotes, e.g., FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 * 3. Install dependencies: `npm install`
 * 4. Run the script from the root of the project: `node -r dotenv/config scripts/seed-patients.js`
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: "service_account",
        project_id: "morgensterhospital-1088c",
        private_key_id: "79a3ebeb56f60989f1f603c3ea70926595d4ca12",
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: "firebase-adminsdk-fbsvc@morgensterhospital-1088c.iam.gserviceaccount.com",
        client_id: "102076691026870342948",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40morgensterhospital-1088c.iam.gserviceaccount.com",
        universe_domain: "googleapis.com"
      }),
      projectId: "morgensterhospital-1088c"
    });
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization failed.', error);
  console.log('Please ensure your FIREBASE_PRIVATE_KEY is set correctly in your .env file.');
  process.exit(1);
}

const db = admin.firestore();

// =================================================================
// HELPER FUNCTIONS
// =================================================================

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

// =================================================================
// SAMPLE PATIENT DATA
// =================================================================

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

// =================================================================
// SEEDING FUNCTION
// =================================================================

const seedPatients = async () => {
  console.log('Starting patient seeding process...');

  // 1. Clear existing patients
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

  // 2. Seed new patients
  console.log('- Seeding 10 new sample patients...');
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

    const patientRef = db.collection('patients').doc(); // Auto-generate ID
    batch.set(patientRef, newPatient);
  }

  await batch.commit();
  console.log('- Seeded 10 new patients.');
  console.log('Patient seeding process completed successfully!');
};

// =================================================================
// EXECUTE SCRIPT
// =================================================================

seedPatients().catch(error => {
  console.error('An error occurred during patient seeding:', error);
  process.exit(1);
});
