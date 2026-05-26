/**
 * Workouts Page Client-Side Logic
 * 
 * Handles:
 * - Loading and displaying workouts
 * - Creating new workouts via modal
 * - Editing existing workouts
 * - Deleting workouts
 */

document.addEventListener('DOMContentLoaded', () => {
  const workoutList = document.getElementById('workoutList');
  const workoutModal = document.getElementById('workoutModal');
  const workoutForm = document.getElementById('workoutForm');
  const modalTitle = document.getElementById('modalTitle');
  const addWorkoutBtn = document.getElementById('addWorkoutBtn');
  const modalClose = document.getElementById('modalClose');
  const cancelBtn = document.getElementById('cancelBtn');

  // Load workouts on page load
  loadWorkouts();

  // --- Open modal to add new workout ---
  addWorkoutBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Add Workout';
    workoutForm.reset();
    document.getElementById('workoutId').value = '';
    openModal();
  });

  // --- Close modal ---
  modalClose.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside
  workoutModal.addEventListener('click', (e) => {
    if (e.target === workoutModal) closeModal();
  });

  // --- Handle form submission (create or update) ---
  workoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const workoutId = document.getElementById('workoutId').value;
    const workoutData = {
      title: document.getElementById('title').value.trim(),
      category: document.getElementById('category').value,
      duration: document.getElementById('duration').value,
      dayOfWeek: document.getElementById('dayOfWeek').value,
      notes: document.getElementById('notes').value.trim()
    };

    // Validate
    if (!workoutData.title || !workoutData.category || !workoutData.duration || !workoutData.dayOfWeek) {
      showModalAlert('Please fill in all required fields');
      return;
    }

    try {
      const url = workoutId ? `/api/workouts/${workoutId}` : '/api/workouts';
      const method = workoutId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData)
      });

      const data = await res.json();

      if (res.ok) {
        closeModal();
        loadWorkouts();
      } else {
        showModalAlert(data.error || 'Error saving workout');
      }
    } catch (error) {
      showModalAlert('Network error. Please try again.');
    }
  });

  /**
   * Fetch and render all workouts
   */
  async function loadWorkouts() {
    try {
      const res = await fetch('/api/workouts');
      if (!res.ok) throw new Error('Failed to fetch');

      const workouts = await res.json();
      renderWorkouts(workouts);
    } catch (error) {
      workoutList.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Error loading workouts</p>';
    }
  }

  /**
   * Render workout cards
   * @param {Array} workouts - Array of workout objects
   */
  function renderWorkouts(workouts) {
    if (workouts.length === 0) {
      workoutList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🏃</div>
          <p>No workouts yet. Create your first workout!</p>
          <button class="btn btn-primary btn-sm" style="width:auto;margin:0 auto;" onclick="document.getElementById('addWorkoutBtn').click()">
            + Add Workout
          </button>
        </div>
      `;
      return;
    }

    workoutList.innerHTML = workouts.map(workout => `
      <div class="workout-card">
        <div class="workout-info">
          <h3>${escapeHtml(workout.title)}</h3>
          <div class="workout-meta">
            <span class="category-badge ${workout.category.toLowerCase()}">${workout.category}</span>
            <span>⏱ ${workout.duration} min</span>
            <span>📅 ${workout.dayOfWeek}</span>
          </div>
          ${workout.notes ? `<p style="color:var(--text-muted);font-size:0.85rem;margin-top:6px;">${escapeHtml(workout.notes)}</p>` : ''}
        </div>
        <div class="workout-actions">
          <button class="btn btn-secondary btn-sm" onclick="editWorkout('${workout._id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteWorkout('${workout._id}')">🗑 Delete</button>
        </div>
      </div>
    `).join('');
  }

  // --- Make edit and delete functions globally accessible ---
  window.editWorkout = async function (id) {
    try {
      const res = await fetch('/api/workouts');
      const workouts = await res.json();
      const workout = workouts.find(w => w._id === id);

      if (workout) {
        modalTitle.textContent = 'Edit Workout';
        document.getElementById('workoutId').value = workout._id;
        document.getElementById('title').value = workout.title;
        document.getElementById('category').value = workout.category;
        document.getElementById('duration').value = workout.duration;
        document.getElementById('dayOfWeek').value = workout.dayOfWeek;
        document.getElementById('notes').value = workout.notes || '';
        openModal();
      }
    } catch (error) {
      console.error('Error loading workout for edit:', error);
    }
  };

  window.deleteWorkout = async function (id) {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    try {
      const res = await fetch(`/api/workouts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadWorkouts();
      } else {
        alert('Error deleting workout');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  // --- Modal helpers ---
  function openModal() {
    workoutModal.classList.add('active');
    hideModalAlert();
  }

  function closeModal() {
    workoutModal.classList.remove('active');
  }

  function showModalAlert(message) {
    const alert = document.getElementById('modalAlert');
    alert.textContent = message;
    alert.style.display = 'block';
  }

  function hideModalAlert() {
    const alert = document.getElementById('modalAlert');
    alert.style.display = 'none';
  }
});

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
