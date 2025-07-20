require('dotenv').config(); 
const geminiService = require('../utils/geminiService');

async function testService() {
  try {
    const connected = await geminiService.testConnection();
    console.log('Connection test:', connected ? 'Success' : 'Failed');

    const sampleNotes = [
      { content: "Customer reported login issues with dashboard" },
      { content: "Issue reproduced on staging environment" },
      { content: "Fix deployed - customer confirmed resolution" }
    ];

    const summary = await geminiService.generateInvoiceNoteSummary(sampleNotes);
    console.log(summary);

  } catch (error) {
    console.error('Service test failed:', error.message);
  }
}

testService();