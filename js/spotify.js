/* ============================================
   TISSAN PORTFOLIO — spotify.js
   Currently: Static decorative widget
   Later: Live Spotify "Now Playing" via API

   TO ACTIVATE LIVE MODE:
   1. Go to https://developer.spotify.com/dashboard
   2. Create an app → get Client ID + Client Secret
   3. Set redirect URI to http://localhost:3000/callback
   4. Get your refresh token using the auth flow
   5. Set up a small serverless function (Vercel) to
      proxy /api/now-playing — it exchanges your
      refresh token for an access token and calls:
      https://api.spotify.com/v1/me/player/currently-playing
   6. Replace SPOTIFY_API_URL below with your endpoint
   7. Set LIVE_MODE = true

   ============================================ */

const LIVE_MODE = false;
const SPOTIFY_API_URL = '/api/now-playing'; // your Vercel function

// Static playlist data for the decorative widget
const STATIC_TRACKS = [
  { name: 'Essence', artist: 'WizKid ft. Tems', playing: true },
  { name: 'Ye', artist: 'Burna Boy', playing: false },
  { name: 'Kaleidoscope', artist: 'Coldplay', playing: false },
  { name: 'Die With A Smile', artist: 'Lady Gaga, Bruno Mars', playing: false },
  { name: 'Nothing', artist: 'Bruno Major', playing: false },
];

let currentTrackIndex = 0;

function renderSpotifyWidget(track) {
  const widget = document.getElementById('spotify-widget');
  if (!widget) return;

  widget.innerHTML = `
    <div class="spotify-art">
      ${track.art
        ? `<img src="${track.art}" alt="${track.name} cover" />`
        : `<span class="spotify-art-placeholder">♫</span>`
      }
    </div>
    <div class="spotify-info">
      <div class="spotify-track">${track.name}</div>
      <div class="spotify-artist">${track.artist}</div>
      <div class="spotify-meta">
        <span class="spotify-badge">
          <span class="spotify-badge-dot"></span>
          ${LIVE_MODE ? 'Now Playing' : 'Listening'}
        </span>
        <span class="spotify-label">· Spotify</span>
      </div>
    </div>
    <div class="spotify-bars">
      <div class="spotify-bar"></div>
      <div class="spotify-bar"></div>
      <div class="spotify-bar"></div>
      <div class="spotify-bar"></div>
    </div>
  `;
}

async function fetchNowPlaying() {
  if (!LIVE_MODE) {
    renderSpotifyWidget(STATIC_TRACKS[currentTrackIndex]);
    // Rotate tracks every 10 seconds for demo effect
    setInterval(() => {
      currentTrackIndex = (currentTrackIndex + 1) % STATIC_TRACKS.length;
      const widget = document.getElementById('spotify-widget');
      if (widget) {
        widget.style.opacity = '0';
        widget.style.transition = 'opacity 0.4s';
        setTimeout(() => {
          renderSpotifyWidget(STATIC_TRACKS[currentTrackIndex]);
          widget.style.opacity = '1';
        }, 400);
      }
    }, 10000);
    return;
  }

  // LIVE MODE
  try {
    const res = await fetch(SPOTIFY_API_URL);
    if (res.status === 204 || res.status > 400) {
      // Nothing playing
      renderSpotifyWidget({ name: 'Not playing right now', artist: 'Spotify', art: null });
      return;
    }
    const data = await res.json();
    renderSpotifyWidget({
      name: data.item?.name || 'Unknown',
      artist: data.item?.artists?.map(a => a.name).join(', ') || 'Unknown',
      art: data.item?.album?.images?.[0]?.url || null,
    });
    // Poll every 30 seconds
    setTimeout(fetchNowPlaying, 30000);
  } catch (err) {
    renderSpotifyWidget({ name: 'Could not connect', artist: 'Spotify', art: null });
  }
}

document.addEventListener('DOMContentLoaded', fetchNowPlaying);
