import { db } from './lib/firebase-admin';

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

    const departmentRef = db.collection('departments').doc(name);
    await departmentRef.set({ name });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Department created successfully' }),
    };
  } catch (error) {
    console.error('Error creating department:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create department' }),
    };
  }
};
