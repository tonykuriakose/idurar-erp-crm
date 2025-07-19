// remove.js
const mongoose = require('mongoose');

const Model = mongoose.model('Query');

const remove = async (req, res) => {
  // Find document by id and delete it
  const result = await Model.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    { removed: true },
    { new: true }
  ).exec();

  // If no results found, return document not found
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  } else {
    // Return success response
    return res.status(200).json({
      success: true,
      result,
      message: 'Successfully deleted the document',
    });
  }
};

module.exports = remove;

