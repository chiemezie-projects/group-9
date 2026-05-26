/**
 * Workout Routes
 * 
 * CRUD operations for workouts.
 * All routes are protected and require authentication.
 * 
 * GET    /api/workouts      - Get all workouts for the current user
 * POST   /api/workouts      - Create a new workout
 * PUT    /api/workouts/:id   - Update an existing workout
 * DELETE /api/workouts/:id   - Delete a workout
 */

const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const requireAuth = require('../middleware/auth');

// All workout routes require authentication
router.use(requireAuth);

/**
 * Get all workouts for the logged-in user
 * Sorted by day of the week
 */
router.get('/', async (req, res) => {
  try {
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const workouts = await Workout.find({ userId: req.session.userId }).sort({ createdAt: -1 });

    // Sort workouts by day of the week
    workouts.sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching workouts' });
  }
});

/**
 * Create a new workout
 * Expects: { title, category, duration, dayOfWeek, notes }
 */
router.post('/', async (req, res) => {
  try {
    const { title, category, duration, dayOfWeek, notes } = req.body;

    // Validate required fields
    if (!title || !category || !duration || !dayOfWeek) {
      return res.status(400).json({ error: 'Title, category, duration, and day are required' });
    }

    const workout = new Workout({
      userId: req.session.userId,
      title,
      category,
      duration: Number(duration),
      dayOfWeek,
      notes: notes || ''
    });

    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Error creating workout' });
  }
});

/**
 * Update an existing workout
 * Only the workout owner can update it
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, category, duration, dayOfWeek, notes } = req.body;

    const workout = await Workout.findOne({
      _id: req.params.id,
      userId: req.session.userId
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Update fields
    if (title) workout.title = title;
    if (category) workout.category = category;
    if (duration) workout.duration = Number(duration);
    if (dayOfWeek) workout.dayOfWeek = dayOfWeek;
    if (notes !== undefined) workout.notes = notes;

    await workout.save();
    res.json(workout);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Error updating workout' });
  }
});

/**
 * Delete a workout
 * Only the workout owner can delete it
 */
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId
    });

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting workout' });
  }
});

module.exports = router;
