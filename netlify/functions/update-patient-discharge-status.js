import { db } from './lib/firebase-admin.js';

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { patientId, dischargeStatus, approvedBy } = JSON.parse(event.body);

    if (!patientId || !dischargeStatus || !approvedBy) {
      return { statusCode: 400, body: 'Missing required fields' };
    }

    const patientRef = db.collection('patients').doc(patientId);
    await patientRef.update({
      dischargeStatus: dischargeStatus,
      dischargeApprovedBy: approvedBy,
      dischargeTimestamp: new Date(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Patient discharge status updated successfully' }),
    };
  } catch (error) {
    console.error('Error updating patient discharge status:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update patient discharge status' }),
    };
  }
};
