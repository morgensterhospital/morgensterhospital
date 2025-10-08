import { db, admin } from './lib/firebase-admin';

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Assuming the user's identity is verified by a client-side token and passed in the body
    // In a real app, you'd verify this token with `admin.auth().verifyIdToken(token)`
    const { patientId, content, type, authorId, authorName, authorRole } = JSON.parse(event.body);

    if (!patientId || !content || !type || !authorId || !authorName || !authorRole) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required note data.' }),
      };
    }

    const noteRef = db.collection('notes').doc();
    const newNote = {
      id: noteRef.id,
      patientId,
      content,
      type, // 'doctor' or 'nurse'
      authorId,
      authorName,
      authorRole,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isEditable: false, // Explicitly making it non-editable as per user request
    };

    await noteRef.set(newNote);

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Note created successfully', note: newNote }),
    };
  } catch (error) {
    console.error('Error creating note:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create note.' }),
    };
  }
};