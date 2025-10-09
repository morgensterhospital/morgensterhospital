import { db } from './lib/firebase-admin';

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { patientId, noteType } = event.queryStringParameters;

    if (!patientId || !noteType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing patientId or noteType parameter.' }),
      };
    }

    // The permission to view these notes is already handled by the frontend UI.
    // This function simply fetches the requested note type for the given patient.
    const notesSnapshot = await db.collection('notes')
      .where('patientId', '==', patientId)
      .where('type', '==', noteType)
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