/* ============================================
   TISSAN PORTFOLIO — spotify.js
   Live "Now Playing" via /api/now-playing
   ============================================ */

const SPOTIFY_API_URL = '/api/now-playing';
const POLL_MS = 30000;

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str == null ? '' : String(str);
  return d.innerHTML;
}

function renderSpotifyWidget({ title, artist, art, url, playing, label }) {
  const widget = document.getElementById('spotify-widget');
  if (!widget) return;

  const artHtml = art
    ? `<img src="${esc(art)}" alt="${esc(title)} cover" />`
    : `<span class="spotify-art-placeholder">♫</span>`;

  const trackHtml = url
    ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(title)}</a>`
    : esc(title);

  widget.innerHTML = `
    <div class="spotify-art">${artHtml}</div>
    <div class="spotify-info">
      <div class="spotify-track">${trackHtml}</div>
      <div class="spotify-artist">${esc(artist)}</div>
      <div class="spotify-meta">
        <span class="spotify-badge">
          ${playing ? '<span class="spotify-badge-dot"></span>' : ''}
          ${esc(label)}
        </span>
        <span class="spotify-label">· Spotify</span>
      </div>
    </div>
    ${playing ? `
    <div class="spotify-bars">
      <div class="spotify-bar"></div>
      <div class="spotify-bar"></div>
      <div class="spotify-bar"></div>
      <div class="spotify-bar"></div>
    </div>` : ''}
  `;
}

function renderOffline() {
  renderSpotifyWidget({
    title: 'Not playing right now',
    artist: 'Check back later',
    art: null,
    url: null,
    playing: false,
    label: 'Offline',
  });
}

async function fetchNowPlaying() {
  try {
    const res = await fetch(SPOTIFY_API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();

    if (data.isPlaying && data.title) {
      renderSpotifyWidget({
        title: data.title,
        artist: data.artist,
        art: data.albumArt,
        url: data.url,
        playing: true,
        label: 'Now Playing',
      });
    } else {
      renderOffline();
    }
  } catch (err) {
    renderOffline();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchNowPlaying();
  setInterval(fetchNowPlaying, POLL_MS);
});