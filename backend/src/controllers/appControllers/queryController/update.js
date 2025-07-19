const mongoose = require('mongoose');

const Model = mongoose.model('Query');
const schema = require('./schemaValidate');

const update = async (req, res) => {
  let body = req.body;

  const { error, value } = schema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  // Find document by id and updates with the required fields
  const result = await Model.findOneAndUpdate(
    { _id: req.params.id, removed: false }, 
    body, 
    {
      new: true, // return the new result instead of the old one
    }
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
    message: 'we update this document ',
  });
};

module.exports = update;