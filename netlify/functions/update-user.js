const { admin } = require('./lib/firebase-admin');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { uid, name, surname, idNumber, phoneNumber, password } = JSON.parse(event.body);
    const auth = admin.auth();
    const db = admin.firestore();

    // Prepare updates for Firebase Auth
    const authUpdates = {
      displayName: `${name} ${surname}`,
    };
    if (password) {
      authUpdates.password = password;
    }
    if (phoneNumber) {
      authUpdates.phoneNumber = phoneNumber;
    }

    // Update Firebase Auth
    await auth.updateUser(uid, authUpdates);

    // Prepare updates for Firestore
    const userRef = db.collection('users').doc(uid);
    const firestoreUpdates = {
      fullName: `${name} ${surname}`,
      name,
      surname,
      idNumber,
      phoneNumber,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Update Firestore
    await userRef.update(firestoreUpdates);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User updated successfully' }),
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update user' }),
    };
  }
};
