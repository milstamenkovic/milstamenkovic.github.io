// Fetch top 5 news about Serbia via Google News RSS (proxied) and current weather via Open-Meteo.
// News refresh: 10 minutes. Weather refresh: 5 minutes.

const newsList = document.getElementById('news-list');
const newsUpdated = document.getElementById('news-updated');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('desc');
const windEl = document.getElementById('wind');
const weatherUpdated = document.getElementById('weather-updated');

async function fetchNews() {
  try {
    const query = encodeURIComponent('Serbia');
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=RS&ceid=RS:en`;
    // Use allorigins proxy to avoid CORS issues
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(proxy);
    if (!res.ok) throw new Error('Failed to fetch news');
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const items = Array.from(doc.querySelectorAll('item')).slice(0, 5);
    newsList.innerHTML = '';
    items.forEach(it => {
      const title = it.querySelector('title')?.textContent || 'No title';
      const link = it.querySelector('link')?.textContent || '#';
      const pubDate = it.querySelector('pubDate')?.textContent || '';
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = link;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = title;
      const meta = document.createElement('div');
      meta.className = 'item-meta';
      meta.textContent = pubDate;
      li.appendChild(a);
      li.appendChild(meta);
      newsList.appendChild(li);
    });
    newsUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
  } catch (err) {
    newsList.innerHTML = '<li class="error">Could not load news.</li>';
    console.error(err);
  }
}

// Open-Meteo fetch for Belgrade coordinates
async function fetchWeather() {
  try {
    const lat = 44.7872, lon = 20.4579;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Europe%2FBelgrade`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather');
    const data = await res.json();
    const cw = data.current_weather;
    if (!cw) throw new Error('No current weather');
    tempEl.textContent = `${cw.temperature}°C`;
    descEl.textContent = weatherCodeToText(cw.weathercode);
    windEl.textContent = `Wind: ${cw.windspeed} km/h (${cw.winddirection}°)`;
    weatherUpdated.textContent = `Last updated: ${new Date(cw.time).toLocaleString()}`;
  } catch (err) {
    tempEl.textContent = '—';
    descEl.textContent = 'Could not load weather.';
    windEl.textContent = '';
    console.error(err);
  }
}

function weatherCodeToText(code) {
  const map = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Drizzle: Light',
    53: 'Drizzle: Moderate',
    55: 'Drizzle: Dense',
    61: 'Rain: Slight',
    63: 'Rain: Moderate',
    65: 'Rain: Heavy',
    71: 'Snow: Slight',
    73: 'Snow: Moderate',
    75: 'Snow: Heavy',
    95: 'Thunderstorm',
  };
  return map[code] || `Weather code ${code}`;
}

// Initial fetch
fetchNews();
fetchWeather();

// Intervals
setInterval(fetchNews, 10 * 60 * 1000); // 10 minutes
setInterval(fetchWeather, 5 * 60 * 1000); // 5 minutes
