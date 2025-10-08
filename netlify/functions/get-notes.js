import { db } from './lib/firebase-admin';

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { patientId, userRole } = event.queryStringParameters;

    if (!patientId || !userRole) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing patientId or userRole parameter.' }),
      };
    }

    // Define which roles can view which note types
    const rolePermissions = {
      Doctor: ['doctor', 'nurse'],
      Nurse: ['doctor', 'nurse'],
      'Laboratory Technician': ['doctor', 'nurse'],
      'X-Ray Operator': ['doctor', 'nurse'],
      Accountant: ['doctor', 'nurse'],
      'Pharmacy Technician': ['doctor', 'nurse'],
      'Rehabilitation Technician': ['doctor', 'nurse'],
      // Add other roles as needed
    };

    const allowedNoteTypes = rolePermissions[userRole];

    if (!allowedNoteTypes) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'You are not authorized to view these notes.' }),
      };
    }

    const notesSnapshot = await db.collection('notes')
      .where('patientId', '==', patientId)
      .where('type', 'in', allowedNoteTypes)
      .orderBy('createdAt', 'desc')
      .get();

    if (notesSnapshot.empty) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }

    const notes = notesSnapshot.docs.map(doc => doc.data());

    return {
      statusCode: 200,
      body: JSON.stringify(notes),
    };
  } catch (error) {
    console.error('Error fetching notes:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch notes.' }),
    };
  }
};