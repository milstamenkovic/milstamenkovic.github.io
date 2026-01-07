// Преузимање 5 најновијих вести на српском (Cyrillic видљивост) и тренутног времена за Ћуприју.
// Освежавање: вести сваких 10 минута, време сваких 5.

const newsList = document.getElementById('news-list');
const newsUpdated = document.getElementById('news-updated');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('desc');
const windEl = document.getElementById('wind');
const weatherUpdated = document.getElementById('weather-updated');

async function fetchNews() {
  try {
    const query = encodeURIComponent('Srbija');
    const googleUrl = `https://news.google.com/rss/search?q=${query}&hl=sr&gl=RS&ceid=RS:sr`;
    const nasloviUrl = 'https://naslovi.net/rss';
    const proxyFor = url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    // Try naslovi.net first (preferred source). If it fails or has no items, fall back to Google News.
    let res = await fetch(proxyFor(nasloviUrl));
    let text = await res.text();
    let doc = new DOMParser().parseFromString(text, 'application/xml');
    let items = Array.from(doc.querySelectorAll('item'));
    if (!items.length) {
      res = await fetch(proxyFor(googleUrl));
      if (!res.ok) throw new Error('Не могу да преузмем вести');
      text = await res.text();
      doc = new DOMParser().parseFromString(text, 'application/xml');
      items = Array.from(doc.querySelectorAll('item')).slice(0, 10);
    } else {
      // keep up to 10 from naslovi then choose top5 by date
      items = items.slice(0, 10);
    }
    // Normalize items with date and description, then pick top 5 by date.
    const parsed = items.map(it => {
      const title = it.querySelector('title')?.textContent || '';
      const link = it.querySelector('link')?.textContent || '#';
      const desc = it.querySelector('description')?.textContent || '';
      const pub = it.querySelector('pubDate')?.textContent || '';
      const date = pub ? new Date(pub) : new Date();
      return {title, link, desc, date};
    });
    parsed.sort((a,b)=>b.date - a.date);
    const top = parsed.slice(0,5);
    newsList.innerHTML = '';
    top.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.link;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = item.title;
      const meta = document.createElement('div');
      meta.className = 'item-meta';
      meta.textContent = item.date.toLocaleString('sr-RS');
      const desc = document.createElement('div');
      desc.className = 'desc';
      desc.innerHTML = sanitizeSnippet(item.desc);
      li.appendChild(a);
      li.appendChild(meta);
      li.appendChild(desc);
      newsList.appendChild(li);
    });
    newsUpdated.textContent = `Ажурирано: ${new Date().toLocaleString('sr-RS')}`;
  } catch (err) {
    newsList.innerHTML = '<li class="error">Није могуће учитати вести.</li>';
    console.error(err);
  }
}

function sanitizeSnippet(html) {
  // Very small sanitizer: strip <img> and scripts but allow basic text/links.
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    Array.from(doc.querySelectorAll('img,script')).forEach(n=>n.remove());
    return doc.body.innerHTML;
  } catch(e) {
    return html.replace(/<[^>]+>/g,'');
  }
}

// Open-Meteo for Ćуприја coordinates
async function fetchWeather() {
  try {
    const lat = 43.9181, lon = 21.3486; // Ćuprija
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Europe%2FBelgrade`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Не могу да преузмем време');
    const data = await res.json();
    const cw = data.current_weather;
    if (!cw) throw new Error('Нема тренутних података о времену');
    tempEl.textContent = `${cw.temperature} °C`;
    descEl.textContent = weatherCodeToText(cw.weathercode);
    windEl.textContent = `Ветар: ${cw.windspeed} km/h (${cw.winddirection}°)`;
    weatherUpdated.textContent = `Ажурирано: ${new Date(cw.time).toLocaleString('sr-RS')}`;
  } catch (err) {
    tempEl.textContent = '—';
    descEl.textContent = 'Не могу да учитам време.';
    windEl.textContent = '';
    console.error(err);
  }
}

function weatherCodeToText(code) {
  const map = {
    0: 'Ведро',
    1: 'Претежно ведро',
    2: 'Делимично облачно',
    3: 'Облачно',
    45: 'Магла',
    48: 'Мрљава магла',
    51: 'Исцедица: благо',
    53: 'Исцедица: умерено',
    55: 'Исцедица: густо',
    61: 'Киша: мало',
    63: 'Киша: умерено',
    65: 'Киша: јако',
    71: 'Снег: мало',
    73: 'Снег: умерено',
    75: 'Снег: много',
    95: 'Олуја',
  };
  return map[code] || `Код: ${code}`;
}

// Initial fetch
fetchNews();
fetchWeather();

// Intervals
setInterval(fetchNews, 10 * 60 * 1000); // 10 minutes
setInterval(fetchWeather, 5 * 60 * 1000); // 5 minutes
