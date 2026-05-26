/**
 * Timer Page Client-Side Logic
 * 
 * Handles:
 * - Countdown timer with start, pause, resume, and reset
 * - Loading workouts into the selector
 * - Logging completed workout to progress when timer finishes
 * - Custom timer input
 */

document.addEventListener('DOMContentLoaded', () => {
  const timerText = document.getElementById('timerText');
  const timerDisplay = document.getElementById('timerDisplay');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const setTimerBtn = document.getElementById('setTimerBtn');
  const timerMinutes = document.getElementById('timerMinutes');
  const timerSeconds = document.getElementById('timerSeconds');
  const timerWorkout = document.getElementById('timerWorkout');

  let totalSeconds = 0;       // Total countdown time in seconds
  let remainingSeconds = 0;   // Remaining time
  let timerInterval = null;   // setInterval reference
  let isRunning = false;
  let isPaused = false;
  let selectedWorkout = null;

  // Load workouts into the dropdown
  loadWorkouts();

  // --- Set timer from custom input ---
  setTimerBtn.addEventListener('click', () => {
    const mins = parseInt(timerMinutes.value) || 0;
    const secs = parseInt(timerSeconds.value) || 0;
    totalSeconds = (mins * 60) + secs;
    remainingSeconds = totalSeconds;
    updateDisplay();
    resetState();
  });

  // --- When a workout is selected, set the timer to its duration ---
  timerWorkout.addEventListener('change', () => {
    const option = timerWorkout.options[timerWorkout.selectedIndex];
    if (option.value) {
      const duration = parseInt(option.dataset.duration) || 10;
      totalSeconds = duration * 60;
      remainingSeconds = totalSeconds;
      timerMinutes.value = duration;
      timerSeconds.value = 0;
      selectedWorkout = {
        id: option.value,
        title: option.textContent,
        duration: duration
      };
      updateDisplay();
      resetState();
    }
  });

  // --- Start / Resume ---
  startBtn.addEventListener('click', () => {
    if (remainingSeconds <= 0) {
      // Set from input if nothing set
      const mins = parseInt(timerMinutes.value) || 0;
      const secs = parseInt(timerSeconds.value) || 0;
      totalSeconds = (mins * 60) + secs;
      remainingSeconds = totalSeconds;
    }

    if (remainingSeconds <= 0) return;

    isRunning = true;
    isPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    timerDisplay.className = 'timer-display running';

    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateDisplay();

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        timerDisplay.className = 'timer-display finished';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        pauseBtn.textContent = '⏸ Pause';

        // Log completion if a workout was selected
        if (selectedWorkout) {
          logCompletion(selectedWorkout.id, selectedWorkout.duration);
        }
      }
    }, 1000);
  });

  // --- Pause / Resume ---
  pauseBtn.addEventListener('click', () => {
    if (isRunning && !isPaused) {
      // Pause
      clearInterval(timerInterval);
      timerInterval = null;
      isPaused = true;
      isRunning = false;
      pauseBtn.textContent = '▶ Resume';
      startBtn.disabled = false;
      timerDisplay.className = 'timer-display paused';
    }
  });

  // --- Reset ---
  resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    remainingSeconds = totalSeconds;
    updateDisplay();
    resetState();
  });

  /**
   * Update the timer display text
   */
  function updateDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Reset button states
   */
  function resetState() {
    isRunning = false;
    isPaused = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pause';
    timerDisplay.className = 'timer-display';
  }

  /**
   * Load workouts into the workout selector dropdown
   */
  async function loadWorkouts() {
    try {
      const res = await fetch('/api/workouts');
      if (!res.ok) return;

      const workouts = await res.json();

      workouts.forEach(workout => {
        const option = document.createElement('option');
        option.value = workout._id;
        option.textContent = `${workout.title} (${workout.category} - ${workout.duration} min)`;
        option.dataset.duration = workout.duration;
        timerWorkout.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  }

  /**
   * Log a completed workout to the progress API
   * @param {string} workoutId - The workout ID
   * @param {number} duration - Duration in minutes
   */
  async function logCompletion(workoutId, duration) {
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutId,
          durationCompleted: duration
        })
      });

      if (res.ok) {
        timerText.textContent = 'Done!';
      }
    } catch (error) {
      console.error('Error logging completion:', error);
    }
  }
});
