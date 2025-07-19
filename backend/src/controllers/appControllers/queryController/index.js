const create = require('./create');
const read = require('./read');
const update = require('./update');
const remove = require('./remove');
const paginatedList = require('./paginatedList');
const summary = require('./summary');
const addNote = require('./addNote');
const removeNote = require('./removeNote');

const queryController = {
  create,
  read,
  update,
  delete: remove,
  list: paginatedList,
  summary,
  addNote,
  removeNote,
};

module.exports = queryController;