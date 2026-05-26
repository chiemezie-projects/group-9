/**
 * Progress Page Client-Side Logic
 * 
 * Handles:
 * - Loading progress statistics (total, streak, weekly)
 * - Displaying recent activity list
 */

document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
});

/**
 * Fetch and display progress data
 */
async function loadProgress() {
  try {
    const res = await fetch('/api/progress');
    if (!res.ok) throw new Error('Failed to fetch progress');

    const data = await res.json();

    // Update stat cards
    document.getElementById('totalWorkouts').textContent = data.totalWorkouts;
    document.getElementById('currentStreak').textContent = data.currentStreak;
    document.getElementById('weeklyCount').textContent = data.weeklyCount;

    // Render recent activity
    renderActivity(data.recentActivity);
  } catch (error) {
    console.error('Error loading progress:', error);
    document.getElementById('activityList').innerHTML =
      '<p style="color:var(--text-muted);text-align:center;padding:2rem;">Error loading progress data</p>';
  }
}

/**
 * Render the recent activity list
 * @param {Array} activities - Array of progress entries
 */
function renderActivity(activities) {
  const activityList = document.getElementById('activityList');

  if (!activities || activities.length === 0) {
    activityList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>No completed workouts yet.</p>
        <p>Go to the <a href="/timer">Timer</a> page to complete a workout!</p>
      </div>
    `;
    return;
  }

  activityList.innerHTML = activities.map(activity => {
    const date = new Date(activity.completionDate);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Get workout info (may be null if workout was deleted)
    const title = activity.workoutId ? activity.workoutId.title : 'Deleted Workout';
    const category = activity.workoutId ? activity.workoutId.category : '';

    // Pick icon based on category
    const icons = {
      'HIIT': '🔥',
      'Running': '🏃',
      'Cardio': '❤️',
      'Strength': '💪'
    };
    const icon = icons[category] || '🏋️';

    return `
      <div class="activity-item">
        <div class="activity-info">
          <div class="activity-icon">${icon}</div>
          <div>
            <strong>${escapeHtml(title)}</strong>
            ${category ? `<span class="category-badge ${category.toLowerCase()}" style="margin-left:8px;">${category}</span>` : ''}
            <div class="activity-date">${dateStr} at ${timeStr}</div>
          </div>
        </div>
        <div class="activity-duration">${activity.durationCompleted} min</div>
      </div>
    `;
  }).join('');
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
