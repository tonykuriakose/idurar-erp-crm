const mongoose = require('mongoose');
const Model = mongoose.model('Invoice');
const geminiService = require('@/utils/geminiService');

const generateSummary = async (req, res) => {
  try {
    const { id } = req.params;

    // Find invoice
    const invoice = await Model.findOne({
      _id: id,
      removed: false,
    }).exec();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        result: null,
        message: 'Invoice not found',
      });
    }

    // Extract notes
    const itemNotes = invoice.items
      .map(item => item.notes)
      .filter(note => note && note.trim() !== '');

    if (itemNotes.length === 0) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'No notes found to summarize',
      });
    }

    // Generate AI summary
    const summary = await geminiService.generateInvoiceNoteSummary(itemNotes);

    // Update invoice with summary
    const updatedInvoice = await Model.findOneAndUpdate(
      { _id: id, removed: false },
      { notesSummary: summary },
      { new: true }
    )
      .populate('client', 'name email phone')
      .populate('createdBy', 'name')
      .exec();

    return res.status(200).json({
      success: true,
      result: {
        invoice: updatedInvoice,
        summary: summary,
        itemNotesCount: itemNotes.length
      },
      message: 'Summary generated successfully',
    });

  } catch (error) {
    console.error('Error generating summary:', error);
    
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return res.status(429).json({
        success: false,
        result: null,
        message: 'AI service rate limit exceeded. Please try again later.',
      });
    }

    if (error.message.includes('quota') || error.message.includes('billing')) {
      return res.status(503).json({
        success: false,
        result: null,
        message: 'AI service temporarily unavailable. Please check API quota.',
      });
    }

    return res.status(500).json({
      success: false,
      result: null,
      message: 'Failed to generate summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = generateSummary;