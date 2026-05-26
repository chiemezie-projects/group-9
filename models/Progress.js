/**
 * Progress Model
 * 
 * Tracks completed workouts for each user.
 * Stores the completion date and actual duration completed.
 */

const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    required: true
  },
  completionDate: {
    type: Date,
    default: Date.now
  },
  durationCompleted: {
    type: Number,
    required: [true, 'Duration completed is required'],
    min: [0, 'Duration cannot be negative']
  }
});

module.exports = mongoose.model('Progress', progressSchema);
