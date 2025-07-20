const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const noteSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});


const querySchema = new Schema({
  queryNumber: {
    type: String,
    unique: true,
    required:false,
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: false,
    autopopulate: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Open', 'InProgress', 'Closed'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  resolution: {
    type: String,
    trim: true,
    default: ''
  },
  assignedTo: {
    type: String,
    trim: true,
    default: ''
  },
  notes: [noteSchema],

  tags: [{
  type: String,
  trim: true
}],
createdBy: {
  type: Schema.Types.ObjectId,
  ref: 'Admin',
  required: true,
  autopopulate: true
},
enabled: {
  type: Boolean,
  default: true
},
  
  removed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


querySchema.plugin(require('mongoose-autopopulate'));


querySchema.virtual('notesCount').get(function() {
  return this.notes ? this.notes.length : 0;
});


querySchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const count = await this.constructor.countDocuments({});
      this.queryNumber = `QRY-${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});


querySchema.index({ status: 1, createdAt: -1 });
querySchema.index({ customer: 1 });
querySchema.index({ queryNumber: 1 });

module.exports = mongoose.model('Query', querySchema);


