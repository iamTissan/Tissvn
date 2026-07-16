/* ============================================
   TISSAN PORTFOLIO — github.js
   GitHub Contributions Heatmap via API
   ============================================ */

const GITHUB_USERNAME = 'iamTissan';

async function loadGithubContributions() {
  const container = document.getElementById('github-heatmap');
  const totalEl = document.getElementById('github-total');
  if (!container) return;

  try {
    // Use the GitHub contributions API via a CORS-friendly proxy
    // We'll use the ghchart.rshah.org approach or construct from events API
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
    );

    if (!response.ok) throw new Error('API error');
    const data = await response.json();

    renderHeatmap(data.contributions, container, totalEl);
  } catch (err) {
    // Fallback: try another source
    try {
      await loadGithubFallback(container, totalEl);
    } catch {
      container.innerHTML = `<div class="github-error">
        Could not load contributions.
        <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" rel="noopener"
           style="color:var(--text-dim);text-decoration:underline;margin-left:6px;">
          View on GitHub ↗
        </a>
      </div>`;
    }
  }
}

async function loadGithubFallback(container, totalEl) {
  // Fallback using GitHub events API (public, no auth needed)
  const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`);
  if (!res.ok) throw new Error('fallback failed');
  const events = await res.json();

  // Build a map of date -> count from push events
  const counts = {};
  events.forEach(ev => {
    if (ev.type === 'PushEvent') {
      const date = ev.created_at.slice(0, 10);
      counts[date] = (counts[date] || 0) + (ev.payload.commits?.length || 1);
    }
  });

  // Generate last 52 weeks of days
  const contributions = generateDateRange(counts);
  renderHeatmap(contributions, container, totalEl);
}

function generateDateRange(counts = {}) {
  const result = [];
  const today = new Date();
  // Go back 52 weeks
  const start = new Date(today);
  start.setDate(start.getDate() - 364);

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, count: counts[dateStr] || 0 });
  }
  return result;
}

function renderHeatmap(contributions, container, totalEl) {
  // Clear loading state
  container.innerHTML = '';

  // Group by week (Sunday start)
  const weeks = [];
  let week = [];

  // Pad first week
  const firstDay = new Date(contributions[0]?.date || new Date());
  const startPad = firstDay.getDay(); // 0=Sun
  for (let i = 0; i < startPad; i++) week.push(null);

  contributions.forEach(day => {
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length) weeks.push(week);

  // Total commits
  const total = contributions.reduce((sum, d) => sum + (d.count || 0), 0);
  if (totalEl) totalEl.textContent = total.toLocaleString() + ' contributions in the last year';

  // Render weeks
  weeks.forEach(w => {
    const weekEl = document.createElement('div');
    weekEl.className = 'github-week';
    w.forEach(day => {
      const dayEl = document.createElement('div');
      dayEl.className = 'github-day';
      if (day) {
        const level = day.count === 0 ? 0 : day.count <= 2 ? 1 : day.count <= 5 ? 2 : day.count <= 9 ? 3 : 4;
        dayEl.dataset.count = level;
        dayEl.title = `${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`;
      } else {
        dayEl.dataset.count = 0;
        dayEl.style.opacity = '0';
      }
      weekEl.appendChild(dayEl);
    });
    container.appendChild(weekEl);
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadGithubContributions);
