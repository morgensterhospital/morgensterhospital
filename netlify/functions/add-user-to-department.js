import { admin, db } from './lib/firebase-admin';

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { fullName, email, password, department } = JSON.parse(event.body);

    if (!fullName || !email || !password || !department) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
    });

    await db.collection('users').doc(userRecord.uid).set({
      fullName,
      email,
      department,
      uid: userRecord.uid,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User created successfully', uid: userRecord.uid }),
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create user' }),
    };
  }
};
