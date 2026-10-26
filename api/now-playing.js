// Vercel serverless function: /api/now-playing
// Reads credentials from environment variables, never hardcode them here.

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';

async function getAccessToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error('Missing Spotify environment variables');
  }

  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });

  if (!res.ok) throw new Error(`Token refresh failed (${res.status})`);
  const data = await res.json();
  return data.access_token;
}

module.exports = async (req, res) => {
  // Cache briefly at the edge so visitors don't each hit Spotify
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=20');

  try {
    const accessToken = await getAccessToken();

    const response = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 204 = nothing playing, 202 = no active device
    if (response.status === 204 || response.status === 202) {
      return res.status(200).json({ isPlaying: false });
    }

    if (!response.ok) {
      return res.status(200).json({ isPlaying: false, error: `spotify_${response.status}` });
    }

    const data = await response.json();

    // Skip podcasts/ads where there is no track item
    if (!data.item || data.currently_playing_type !== 'track') {
      return res.status(200).json({ isPlaying: false });
    }

    return res.status(200).json({
      isPlaying: data.is_playing,
      title: data.item.name,
      artist: data.item.artists.map((a) => a.name).join(', '),
      album: data.item.album.name,
      albumArt: data.item.album.images?.[1]?.url || data.item.album.images?.[0]?.url || null,
      url: data.item.external_urls?.spotify || null,
    });
  } catch (err) {
    return res.status(200).json({ isPlaying: false, error: 'server_error' });
  }
};