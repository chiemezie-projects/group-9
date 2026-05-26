/**
 * Progress Routes
 * 
 * Tracks and retrieves workout completion data.
 * All routes are protected and require authentication.
 * 
 * GET  /api/progress      - Get progress stats for the current user
 * POST /api/progress      - Log a completed workout
 */

const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const requireAuth = require('../middleware/auth');

// All progress routes require authentication
router.use(requireAuth);

/**
 * Get progress statistics for the logged-in user
 * Returns: totalWorkouts, currentStreak, weeklyCount, recentActivity
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get all progress entries for this user, sorted by date
    const allProgress = await Progress.find({ userId })
      .populate('workoutId', 'title category duration dayOfWeek')
      .sort({ completionDate: -1 });

    // Total workouts completed
    const totalWorkouts = allProgress.length;

    // Workouts completed this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyCount = allProgress.filter(p =>
      new Date(p.completionDate) >= startOfWeek
    ).length;

    // Calculate current streak (consecutive days with at least one workout)
    let currentStreak = 0;
    if (allProgress.length > 0) {
      // Get unique dates (as date strings) sorted descending
      const uniqueDates = [...new Set(
        allProgress.map(p => {
          const d = new Date(p.completionDate);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
      )];

      // Check if today or yesterday has a workout (streak must be current)
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

      if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
        // Count consecutive days backwards from today
        const startDate = uniqueDates.includes(todayStr) ? today : yesterday;
        let checkDate = new Date(startDate);

        for (let i = 0; i < 365; i++) {
          const checkStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
          if (uniqueDates.includes(checkStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // Recent activity (last 10 entries)
    const recentActivity = allProgress.slice(0, 10);

    res.json({
      totalWorkouts,
      currentStreak,
      weeklyCount,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching progress' });
  }
});

/**
 * Log a completed workout
 * Expects: { workoutId, durationCompleted }
 */
router.post('/', async (req, res) => {
  try {
    const { workoutId, durationCompleted } = req.body;

    if (!workoutId || durationCompleted === undefined) {
      return res.status(400).json({ error: 'Workout ID and duration completed are required' });
    }

    const progress = new Progress({
      userId: req.session.userId,
      workoutId,
      durationCompleted: Number(durationCompleted),
      completionDate: new Date()
    });

    await progress.save();

    // Populate workout info before returning
    await progress.populate('workoutId', 'title category duration dayOfWeek');

    res.status(201).json(progress);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Error logging progress' });
  }
});

module.exports = router;
