const API_BASE = 'http://localhost:5000/api';
const logoutButton = document.getElementById('logoutButton');
const usernameEl = document.getElementById('username');
const emailEl = document.getElementById('email');
const bioEl = document.getElementById('bio');
const avatarEl = document.getElementById('avatar');
const profileForm = document.getElementById('profileForm');
const bioInput = document.getElementById('bioInput');
const avatarUrlInput = document.getElementById('avatarUrlInput');
const profileMessage = document.getElementById('profileMessage');
const postsContainer = document.getElementById('posts');

const token = localStorage.getItem('codealphaToken');
const userId = localStorage.getItem('codealphaUserId');
if (!token || !userId) {
  window.location.href = 'login.html';
}

const authHeaders = () => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const loadProfile = async () => {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders(),
    });
    const user = await response.json();
    if (!response.ok) {
      profileMessage.textContent = user.message || 'Unable to load profile.';
      return;
    }

    usernameEl.textContent = user.username;
    emailEl.textContent = user.email;
    bioEl.textContent = user.bio || 'No bio yet.';
    avatarEl.textContent = user.username?.charAt(0).toUpperCase() || '?';
    if (user.avatarUrl) {
      avatarEl.style.backgroundImage = `url('${user.avatarUrl}')`;
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.textContent = '';
    }
    bioInput.value = user.bio || '';
    avatarUrlInput.value = user.avatarUrl || '';
  } catch (error) {
    profileMessage.textContent = 'Could not load profile.';
  }
};

const loadPosts = async () => {
  postsContainer.innerHTML = '<p>Loading your posts...</p>';
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/posts`, {
      headers: authHeaders(),
    });
    const posts = await response.json();
    if (!response.ok) {
      postsContainer.innerHTML = `<p>${posts.message || 'Unable to load posts.'}</p>`;
      return;
    }

    if (posts.length === 0) {
      postsContainer.innerHTML = '<p>No posts yet.</p>';
      return;
    }

    postsContainer.innerHTML = posts.map((post) => `
      <article class="post-card">
        <header>
          <strong>Your post</strong>
          <span class="post-meta">${new Date(post.createdAt).toLocaleString()}</span>
        </header>
        <p>${post.content}</p>
        <div class="post-meta">${post.likes} likes</div>
      </article>
    `).join('');
  } catch (error) {
    postsContainer.innerHTML = '<p>Could not load your posts.</p>';
  }
};

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  profileMessage.textContent = '';

  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        bio: bioInput.value.trim(),
        avatarUrl: avatarUrlInput.value.trim(),
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      profileMessage.textContent = result.message || 'Could not update profile.';
      return;
    }

    profileMessage.textContent = 'Profile updated successfully.';
    loadProfile();
  } catch (error) {
    profileMessage.textContent = 'Unable to update profile.';
  }
});

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('codealphaToken');
  localStorage.removeItem('codealphaUserId');
  window.location.href = 'login.html';
});

loadProfile();
loadPosts();
