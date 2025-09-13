import PDFDocument from 'pdfkit';

// A helper function to build the PDF table with pagination
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
  const pageBottom = doc.page.height - doc.page.margins.bottom;

  const drawHeader = () => {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Patient Name', itemX, doc.y)
      .text('Date', dateX, doc.y)
      .text('Amount ($)', amountX, doc.y, { align: 'right' });
    doc.moveTo(itemX, doc.y + 15).lineTo(doc.page.width - itemX, doc.y + 15).stroke();
    doc.moveDown();
  };

  drawHeader();

  // Table Rows
  for (const transaction of transactions) {
    try {
      // Check if there is enough space for the next row, if not, add a new page
      if (doc.y + 20 > pageBottom) {
        doc.addPage();
        drawHeader();
      }

      const y = doc.y;
      const patientName = transaction.patientName || 'N/A';
      const date = transaction.date ? new Date(transaction.date).toLocaleString() : 'N/A';
      const amount = typeof transaction.amount === 'number' ? transaction.amount.toFixed(2) : '0.00';

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(patientName, itemX, y, { width: dateX - itemX - 10 }) // Add width to prevent text overlap
        .text(date, dateX, y)
        .text(amount, amountX, y, { align: 'right' });
      doc.moveDown();
    } catch (loopError) {
      console.error('Error processing a transaction for PDF, skipping.', loopError, transaction);
    }
  }
}

// A promise-based wrapper for the PDF generation
const generatePdfPromise = (reportType, transactions) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err) => reject(err));

    buildTable(doc, reportType, transactions);

    doc.end();
  });
};


export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { reportType, transactions } = JSON.parse(event.body);

    if (typeof reportType !== 'string' || !Array.isArray(transactions)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid input: reportType must be a string and transactions must be an array.' })
      };
    }

    // Sanitize the filename to remove characters that are invalid in a header or filesystem.
    const sanitizedFilename = reportType.replace(/[^a-zA-Z0-9_.-]/g, '_');

    // Await the promise to ensure the PDF is fully generated
    const pdfData = await generatePdfPromise(reportType, transactions);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${sanitizedFilename}.pdf"`
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
