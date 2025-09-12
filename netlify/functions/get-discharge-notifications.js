const { db } = require('../../src/services/firebase-admin');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const notificationsSnapshot = await db.collection('discharge-notifications').where('status', '==', 'pending').get();
    const notifications = [];
    notificationsSnapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    return {
      statusCode: 200,
      body: JSON.stringify(notifications),
    };
  } catch (error) {
    console.error('Error getting discharge notifications:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get discharge notifications' }),
    };
  }
};
