const mongoose = require('mongoose');

const Model = mongoose.model('Query');

const addNote = async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Note content is required',
    });
  }

  const newNote = {
    content: content.trim(),
    author: req.admin.name || 'Admin',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Find document and add note
  const result = await Model.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    { $push: { notes: newNote } },
    { new: true }
  )
    .populate('customer', 'name email phone')
    .populate('createdBy', 'name')
    .exec();

  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  }

  // Returning successful response
  return res.status(200).json({
    success: true,
    result,
    message: 'Note added successfully',
  });
};

module.exports = addNote;