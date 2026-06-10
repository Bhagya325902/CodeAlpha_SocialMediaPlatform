const API_BASE = 'http://localhost:5000/api';
const form = document.getElementById('loginForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';

  const payload = {
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value.trim(),
  };

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      message.textContent = data.message || 'Unable to login.';
      return;
    }

    localStorage.setItem('codealphaToken', data.token);
    localStorage.setItem('codealphaUserId', data.user.id);
    window.location.href = 'home.html';
  } catch (error) {
    message.textContent = 'Login failed. Please try again.';
  }
});
