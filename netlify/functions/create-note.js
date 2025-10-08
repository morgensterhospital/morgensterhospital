import { db, admin } from './lib/firebase-admin';

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { patientId, content, type, authorId, authorName, authorRole, isUpdate } = JSON.parse(event.body);

    if (!patientId || !content || !type || !authorId || !authorName || !authorRole) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required note data.' }),
      };
    }

    // Validate that content is an object
    if (typeof content !== 'object' || content === null) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid note content format.' }),
        };
    }

    const noteRef = db.collection('notes').doc();
    const newNote = {
      id: noteRef.id,
      patientId,
      content, // content is now an object
      type,
      authorId,
      authorName,
      authorRole,
      isUpdate: isUpdate || false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await noteRef.set(newNote);

    // Return the full note object including the server-generated timestamp
    const createdNote = { ...newNote, createdAt: new Date().toISOString() };

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Note created successfully', note: createdNote }),
    };
  } catch (error) {
    console.error('Error creating note:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create note.' }),
    };
  }
};