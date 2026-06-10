const API_BASE = 'http://localhost:5000/api';
const feedContainer = document.getElementById('feed');
const postForm = document.getElementById('postForm');
const postMessage = document.getElementById('postMessage');
const logoutButton = document.getElementById('logoutButton');

const token = localStorage.getItem('codealphaToken');
if (!token) {
  window.location.href = 'login.html';
}

const authHeaders = () => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

const loadPosts = async () => {
  feedContainer.innerHTML = '<p>Loading feed...</p>';
  try {
    const response = await fetch(`${API_BASE}/posts`, {
      headers: authHeaders(),
    });
    const posts = await response.json();
    if (!response.ok) {
      feedContainer.innerHTML = `<p>${posts.message || 'Could not load posts.'}</p>`;
      return;
    }

    if (posts.length === 0) {
      feedContainer.innerHTML = '<p>No posts yet. Be the first to share.</p>';
      return;
    }

    feedContainer.innerHTML = posts.map((post) => {
      return `
        <article class="post-card">
          <header>
            <div>
              <strong>${post.author?.username || 'Unknown'}</strong>
              <div class="post-meta">${new Date(post.createdAt).toLocaleString()}</div>
            </div>
            <span class="post-meta">${post.likes} like${post.likes === 1 ? '' : 's'}</span>
          </header>
          <p>${post.content}</p>
        </article>
      `;
    }).join('');
  } catch (error) {
    feedContainer.innerHTML = '<p>Unable to load feed.</p>';
  }
};

postForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  postMessage.textContent = '';
  const content = document.getElementById('content').value.trim();

  if (!content) {
    postMessage.textContent = 'Please enter a message to post.';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    if (!response.ok) {
      postMessage.textContent = data.message || 'Could not create post.';
      return;
    }

    document.getElementById('content').value = '';
    postMessage.textContent = 'Post published!';
    loadPosts();
  } catch (error) {
    postMessage.textContent = 'Unable to publish post.';
  }
});

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('codealphaToken');
  localStorage.removeItem('codealphaUserId');
  window.location.href = 'login.html';
});

loadPosts();
