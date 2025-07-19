const mongoose = require('mongoose');

const Model = mongoose.model('Query');

const summary = async (req, res) => {
  try {
    const totalQueries = await Model.countDocuments({ removed: false });
    const openQueries = await Model.countDocuments({ removed: false, status: 'Open' });
    const inProgressQueries = await Model.countDocuments({ removed: false, status: 'InProgress' });
    const closedQueries = await Model.countDocuments({ removed: false, status: 'Closed' });
    
    const highPriorityQueries = await Model.countDocuments({ 
      removed: false, 
      priority: { $in: ['High', 'Critical'] },
      status: { $ne: 'Closed' }
    });

    // Calculate resolution rate
    const resolutionRate = totalQueries > 0 ? Math.round((closedQueries / totalQueries) * 100) : 0;

    const result = {
      totalQueries,
      openQueries,
      inProgressQueries,
      closedQueries,
      highPriorityQueries,
      resolutionRate
    };

    return res.status(200).json({
      success: true,
      result,
      message: 'Successfully found all summaries',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Internal server error',
    });
  }
};

module.exports = summary;