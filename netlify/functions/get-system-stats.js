import { db } from './lib/firebase-admin';

exports.handler = async function(event, context) {
  try {
    const usersSnapshot = await db.collection('users').get();
    const patientsSnapshot = await db.collection('patients').get();
    const departmentsSnapshot = await db.collection('departments').get();

    const totalUsers = usersSnapshot.size;
    const totalPatients = patientsSnapshot.size;
    const activeDepartments = departmentsSnapshot.size;

    return {
      statusCode: 200,
      body: JSON.stringify({
        totalUsers,
        totalPatients,
        activeDepartments,
      }),
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch system stats' }),
    };
  }
};
