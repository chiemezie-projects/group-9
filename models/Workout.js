/**
 * Workout Model
 * 
 * Stores workout details linked to a user.
 * Each workout is assigned to a specific day of the week.
 */

const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Workout title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['HIIT', 'Running', 'Cardio', 'Strength'],
      message: 'Category must be HIIT, Running, Cardio, or Strength'
    }
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  dayOfWeek: {
    type: String,
    required: [true, 'Day of the week is required'],
    enum: {
      values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      message: 'Must be a valid day of the week'
    }
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Workout', workoutSchema);
