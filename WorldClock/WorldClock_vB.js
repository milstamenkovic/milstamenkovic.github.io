// WorldClock
// WorldClock JavaScript code to embed as IMG inside WordPress.com website
// Version B
// © 2026 Mil Stamenković
// Created with help of Free Claude AI
// Направљено:  09.04.2026. - Ćuprija, Serbia
// Преправљено: 09.04.2026. - Ćuprija, Serbia



// Cloudflare Worker — SVG WorldClock
// Deploy at: Workers & Pages → Create Worker

export default {
  async fetch(request) {

    const zones = [
      { name: 'Ћуприја/Ćuprija',  offsetFn: europeBelgrade },
      { name: 'Њујорк/New York', offsetFn: americaNewYork },
      { name: 'Москва/Moscow',   offsetFn: () => 3 },
      { name: 'Пекинг/Beijing',  offsetFn: () => 8 },
    ];

    const now = new Date();

    const clocks = zones.map(z => {
      const offset = z.offsetFn(now);
      const local = new Date(now.getTime() + offset * 3600 * 1000);
      const h = local.getUTCHours();
      const m = local.getUTCMinutes();
      const s = local.getUTCSeconds();
      return renderClock(z.name, h, m, s);
    });

    const totalW = 360;
    const totalH = 1240;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${totalW}" height="${totalH}" fill="#0e0e0e" rx="14"/>

  <!-- Clocks -->
  <g transform="translate(${totalW / 6}, 20)">${clocks[0]}</g>
  <g transform="translate(${totalW / 6}, 300)">${clocks[1]}</g>
  <g transform="translate(${totalW / 6}, 580)">${clocks[2]}</g>
  <g transform="translate(${totalW / 6}, 860)">${clocks[3]}</g>

  <!-- Footer -->
  <text x="${totalW / 2}" y="${totalH - 64}" text-anchor="middle" 
      font-family="'Courier New',monospace" font-size="12" fill="#444" 
      letter-spacing="1">
    <tspan x="${totalW / 2}" dy="1em" fill="red">Освежите страницу</tspan>
    <tspan x="${totalW / 2}" dy="1em" fill="red">како бисте видели тренутна времена</tspan>
    <tspan x="${totalW / 2}" dy="1em" fill="white">- - -</tspan>
    <tspan x="${totalW / 2}" dy="1em">Refresh page to see current times</tspan>
</text>
</svg>`;

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};

function renderClock(cityName, h, m, s) {
  const pad = n => String(n).padStart(2, '0');
  const digitalTime = `${pad(h)}h${pad(m)}m${pad(s)}s`;

  const hAngle = ((h % 12) / 12 + m / 720) * 2 * Math.PI;
  const mAngle = (m / 60 + s / 3600) * 2 * Math.PI;
  const sAngle = (s / 60) * 2 * Math.PI;

  const hand = (angle, len, back = 10) => {
    const cos = Math.cos(angle - Math.PI / 2);
    const sin = Math.sin(angle - Math.PI / 2);
    return {
      x2: (cos * len).toFixed(2), y2: (sin * len).toFixed(2),
      x1: (-cos * back).toFixed(2), y1: (-sin * back).toFixed(2),
    };
  };

  const H = hand(hAngle, 52, 10);
  const M = hand(mAngle, 72, 12);
  const S = hand(sAngle, 82, 14);

  let ticks = '';
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
    const major = i % 5 === 0;
    const r1 = major ? 80 : 87;
    const r2 = 93;
    ticks += `<line x1="${(Math.cos(a)*r1).toFixed(2)}" y1="${(Math.sin(a)*r1).toFixed(2)}" x2="${(Math.cos(a)*r2).toFixed(2)}" y2="${(Math.sin(a)*r2).toFixed(2)}" stroke="${major ? '#777' : '#3a3a3a'}" stroke-width="${major ? 2 : 1}"/>`;
  }

  let nums = '';
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
    nums += `<text x="${(Math.cos(a)*67).toFixed(2)}" y="${(Math.sin(a)*67+4).toFixed(2)}" text-anchor="middle" font-family="'Courier New',monospace" font-size="10" fill="#555">${i}</text>`;
  }

  // City name — handle Ćuprija special char safely
  const safeName = cityName
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/Ć/g, '&#262;')
    .replace(/ć/g, '&#263;');

  return `
<g transform="translate(120, 130)">
  <!-- City label -->
  <text x="0" y="-118" text-anchor="middle"
    font-family="'Courier New',monospace" font-size="13" fill="#999"
    letter-spacing="2">${safeName}</text>
  <!-- Face -->
  <circle r="100" fill="#111" stroke="#2a2a2a" stroke-width="1.5"/>
  ${ticks}
  ${nums}
  <!-- Hour hand -->
  <line x1="${H.x1}" y1="${H.y1}" x2="${H.x2}" y2="${H.y2}" stroke="#cccccc" stroke-width="4" stroke-linecap="round"/>
  <!-- Minute hand -->
  <line x1="${M.x1}" y1="${M.y1}" x2="${M.x2}" y2="${M.y2}" stroke="#aaaaaa" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Second hand -->
  <line x1="${S.x1}" y1="${S.y1}" x2="${S.x2}" y2="${S.y2}" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Center -->
  <circle r="4" fill="#c0392b"/>
  <!-- Digital -->
  <text x="0" y="118" text-anchor="middle"
    font-family="'Courier New',monospace" font-size="13" fill="#888"
    letter-spacing="2">${digitalTime}</text>
</g>`;
}

// Serbia — CET (UTC+1) / CEST (UTC+2)
function europeBelgrade(date) {
  return isCEST(date, lastSunday) ? 2 : 1;
}

// New York — EST (UTC-5) / EDT (UTC-4)
function americaNewYork(date) {
  const year = date.getUTCFullYear();
  // EDT: 2nd Sunday March 02:00 → 1st Sunday November 02:00
  const start = nthSunday(year, 2, 2); // March, 2nd Sunday
  const end   = nthSunday(year, 10, 1); // November, 1st Sunday
  return (date >= start && date < end) ? -4 : -5;
}

function isCEST(date) {
  const year = date.getUTCFullYear();
  return date >= lastSunday(year, 2) && date < lastSunday(year, 9);
}

function lastSunday(year, month) {
  const d = new Date(Date.UTC(year, month + 1, 0));
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  d.setUTCHours(1, 0, 0, 0);
  return d;
}

function nthSunday(year, month, n) {
  const d = new Date(Date.UTC(year, month, 1));
  const day = d.getUTCDay();
  d.setUTCDate(1 + ((7 - day) % 7) + (n - 1) * 7);
  d.setUTCHours(7, 0, 0, 0); // 02:00 ET = 07:00 UTC
  return d;
}