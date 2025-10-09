import { admin, db } from './lib/firebase-admin';

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, surname, email, password, department, idNumber, phoneNumber, role } = JSON.parse(event.body);

    if (!name || !surname || !email || !password || !department || !role) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: name, surname, email, password, department, and role are required.' }),
      };
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${name} ${surname}`,
    });

    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      surname,
      email,
      department,
      idNumber: idNumber || '',
      phoneNumber: phoneNumber || '',
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      profileCompleted: false,
      wardType: '', // This can be populated later if needed
    });

    // Optionally set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { role, department });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User created successfully', uid: userRecord.uid }),
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create user.' }),
    };
  }
};