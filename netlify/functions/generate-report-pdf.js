import PDFDocument from 'pdfkit';

// A helper function to build the PDF table
function buildTable(doc, title, transactions) {
  // Header
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('Morgenster Hospital', { align: 'center' });

  doc
    .fontSize(16)
    .font('Helvetica')
    .text(title, { align: 'center' });

  doc.moveDown(2);

  // Table Headers
  const tableTop = doc.y;
  const itemX = 50;
  const dateX = 250;
  const amountX = 450;

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Patient Name', itemX, tableTop)
    .text('Date', dateX, tableTop)
    .text('Amount ($)', amountX, tableTop, { align: 'right' });

  doc.moveTo(itemX, doc.y + 5).lineTo(doc.page.width - itemX, doc.y + 5).stroke();
  doc.moveDown();

  // Table Rows
  for (const transaction of transactions) {
    const y = doc.y;
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(transaction.patientName, itemX, y)
      .text(new Date(transaction.date).toLocaleString(), dateX, y)
      .text(transaction.amount.toFixed(2), amountX, y, { align: 'right' });
    doc.moveDown();
  }
}

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { reportType, transactions } = JSON.parse(event.body);

    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    // Generate the table based on the data
    buildTable(doc, reportType, transactions);

    doc.end();

    // Concatenate the buffers to get the full PDF
    const pdfData = Buffer.concat(buffers);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${reportType}.pdf"`
      },
      body: pdfData.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate PDF', details: error.message }),
    };
  }
};