const mongoose = require('mongoose');

const Model = mongoose.model('Query');

const read = async (req, res) => {
  // Find document by id
  const result = await Model.findOne({
    _id: req.params.id,
    removed: false,
  })
    .populate('customer', 'name email phone')
    .populate('createdBy', 'name')
    .exec();
    
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
      message: 'we found this document ',
    });
  }
};

module.exports = read;