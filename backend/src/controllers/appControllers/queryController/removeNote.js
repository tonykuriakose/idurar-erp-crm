const mongoose = require('mongoose');

const Model = mongoose.model('Query');

const removeNote = async (req, res) => {
  const { noteId } = req.params;

  // Find document and remove note
  const result = await Model.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    { $pull: { notes: { _id: noteId } } },
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
    message: 'Note removed successfully',
  });
};

module.exports = removeNote;