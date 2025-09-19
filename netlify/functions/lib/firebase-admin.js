import admin from 'firebase-admin'

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
  })
}

const db = admin.firestore()

export { admin, db }
