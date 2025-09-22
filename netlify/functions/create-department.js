import { db } from './lib/firebase-admin';
import admin from 'firebase-admin';

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name } = JSON.parse(event.body);

    if (!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Department name is required' }),
      };
    }

    const id = name.toLowerCase().replace(/\s+/g, '-');
    const departmentRef = db.collection('departments').doc(id);

    await departmentRef.set({
      id: id,
      name: name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Department created successfully', id: id }),
    };
  } catch (error) {
    console.error('Error creating department:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create department' }),
    };
  }
};
