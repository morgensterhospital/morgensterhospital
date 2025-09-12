import { db } from './lib/firebase-admin.js';

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { patientId, doctorId, doctorName, patientName } = JSON.parse(event.body);

    if (!patientId || !doctorId || !doctorName || !patientName) {
      return { statusCode: 400, body: 'Missing required fields' };
    }

    const notificationRef = await db.collection('discharge-notifications').add({
      patientId,
      doctorId,
      doctorName,
      patientName,
      status: 'pending',
      timestamp: new Date(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Discharge notification created successfully', notificationId: notificationRef.id }),
    };
  } catch (error) {
    console.error('Error creating discharge notification:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create discharge notification' }),
    };
  }
};
