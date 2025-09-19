import admin from 'firebase-admin'

console.log('firebase-admin.js: Module loaded.');

if (!admin.apps.length) {
  console.log('firebase-admin.js: No existing Firebase apps, attempting to initialize.');

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    console.error('firebase-admin.js: ERROR - FIREBASE_PRIVATE_KEY environment variable is not set.');
  } else {
    console.log('firebase-admin.js: FIREBASE_PRIVATE_KEY is set.');
  }

  try {
    const key = privateKey.replace(/\\n/g, '\n');
    console.log('firebase-admin.js: Private key after replacing newlines seems okay.');

    admin.initializeApp({
      credential: admin.credential.cert({
        type: "service_account",
        project_id: "morgensterhospital-1088c",
        private_key: key,
        private_key_id: "79a3ebeb56f60989f1f603c3ea70926595d4ca12",
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
    console.log('firebase-admin.js: initializeApp completed successfully.');
  } catch (e) {
    console.error('firebase-admin.js: CRITICAL - Error during initializeApp:', e);
  }
} else {
  console.log('firebase-admin.js: Firebase app already exists.');
}

export const db = admin.firestore()
console.log('firebase-admin.js: Firestore instance created.');
