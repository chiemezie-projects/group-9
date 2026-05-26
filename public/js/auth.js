/**
 * Authentication Client-Side Logic
 * 
 * Handles:
 * - Login form submission
 * - Registration form submission
 * - Logout button
 * - Mobile navigation toggle
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- Login Form ---
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showAlert('Please fill in all fields');
        return;
      }

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
          window.location.href = '/dashboard';
        } else {
          showAlert(data.error || 'Login failed');
        }
      } catch (error) {
        showAlert('Network error. Please try again.');
      }
    });
  }

  // --- Register Form ---
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (!name || !email || !password || !confirmPassword) {
        showAlert('Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        showAlert('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        showAlert('Password must be at least 6 characters');
        return;
      }

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
          window.location.href = '/dashboard';
        } else {
          showAlert(data.error || 'Registration failed');
        }
      } catch (error) {
        showAlert('Network error. Please try again.');
      }
    });
  }

  // --- Logout Button ---
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login';
      } catch (error) {
        window.location.href = '/login';
      }
    });
  }

  // --- Mobile Nav Toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // --- Load user name in nav ---
  const navUser = document.getElementById('navUser');
  if (navUser) {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          navUser.textContent = data.user.name;
        }
      })
      .catch(() => {});
  }
});

/**
 * Show an alert message on the page
 * @param {string} message - The error message to display
 */
function showAlert(message) {
  const alert = document.getElementById('alert');
  if (alert) {
    alert.textContent = message;
    alert.style.display = 'block';
    setTimeout(() => { alert.style.display = 'none'; }, 5000);
  }
}
