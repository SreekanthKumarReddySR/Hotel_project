
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a room title'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  maxPeople: {
    type: Number,
    required: [true, 'Please add maximum number of people']
  },
  desc: {
    type: String,
    required: [true, 'Please add a description']
  },
  roomNumbers: [{ 
    number: Number, 
    unavailableDates: {
      type: [Date]
    }
  }],
  isCleaned: {
    type: Boolean,
    default: true
  },
  isAssigned: {
    type: Boolean,
    default: false
  },
  bookedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', RoomSchema);
