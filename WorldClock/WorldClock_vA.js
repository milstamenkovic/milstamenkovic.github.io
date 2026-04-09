// WorldClock
// WorldClock JavaScript code to embed as IMG inside WordPress.com website
// Version A
// © 2026 Mil Stamenković
// Created with help of Free Claude AI
// Направљено:  09.04.2026. - Ćuprija, Serbia
// Преправљено: 09.04.2026. - Ćuprija, Serbia



// Cloudflare Worker — SVG WorldClock
// Deploy at: Workers & Pages → Create Worker

export default {
  async fetch(request) {
    const now = new Date();

    // Belgrade is UTC+1 (CET) or UTC+2 (CEST in summer)
    // Cloudflare Workers run in UTC — we offset manually
    const offsetHours = isCEST(now) ? 2 : 1;
    const local = new Date(now.getTime() + offsetHours * 3600 * 1000);

    const h = local.getUTCHours();
    const m = local.getUTCMinutes();
    const s = local.getUTCSeconds();

    const pad = n => String(n).padStart(2, '0');
    const digitalTime = `${pad(h)}:${pad(m)}:${pad(s)}`;

    // Angles in radians, starting from 12 o'clock
    const hAngle = ((h % 12) / 12 + m / 720) * 2 * Math.PI;
    const mAngle = (m / 60 + s / 3600) * 2 * Math.PI;
    const sAngle = (s / 60) * 2 * Math.PI;

    const hand = (angle, len, back = 10) => {
      const cos = Math.cos(angle - Math.PI / 2);
      const sin = Math.sin(angle - Math.PI / 2);
      return {
        x2: (cos * len).toFixed(2),
        y2: (sin * len).toFixed(2),
        x1: (-cos * back).toFixed(2),
        y1: (-sin * back).toFixed(2),
      };
    };

    const H = hand(hAngle, 58, 12);
    const M = hand(mAngle, 82, 14);
    const S = hand(sAngle, 93, 16);

    // Generate tick marks
    let ticks = '';
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
      const major = i % 5 === 0;
      const r1 = major ? 88 : 95;
      const r2 = 103;
      const x1 = (Math.cos(a) * r1).toFixed(2);
      const y1 = (Math.sin(a) * r1).toFixed(2);
      const x2 = (Math.cos(a) * r2).toFixed(2);
      const y2 = (Math.sin(a) * r2).toFixed(2);
      const stroke = major ? '#777' : '#3a3a3a';
      const sw = major ? '2' : '1';
      ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }

    // Hour numbers
    let nums = '';
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
      const x = (Math.cos(a) * 75).toFixed(2);
      const y = (Math.sin(a) * 75 + 4).toFixed(2);
      nums += `<text x="${x}" y="${y}" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" fill="#555">${i}</text>`;
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="240" height="270" viewBox="-120 -120 240 270" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="-120" y="-120" width="240" height="270" fill="#0e0e0e" rx="12"/>
  <!-- Clock face -->
  <circle r="110" fill="#111" stroke="#2a2a2a" stroke-width="1.5"/>
  <!-- Ticks -->
  ${ticks}
  <!-- Hour numbers -->
  ${nums}
  <!-- Hour hand -->
  <line x1="${H.x1}" y1="${H.y1}" x2="${H.x2}" y2="${H.y2}" stroke="#cccccc" stroke-width="4" stroke-linecap="round"/>
  <!-- Minute hand -->
  <line x1="${M.x1}" y1="${M.y1}" x2="${M.x2}" y2="${M.y2}" stroke="#aaaaaa" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Second hand -->
  <line x1="${S.x1}" y1="${S.y1}" x2="${S.x2}" y2="${S.y2}" stroke="#c0392b" stroke-width="1.5" stroke-linecap="round"/>
  <!-- Center dot -->
  <circle r="5" fill="#c0392b"/>
  <!-- Digital readout -->
  <text x="0" y="128" text-anchor="middle" font-family="'Courier New',monospace" font-size="14" fill="#888" letter-spacing="2">${digitalTime}</text>
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

// Returns true during Central European Summer Time (last Sun March → last Sun October)
function isCEST(date) {
  const year = date.getUTCFullYear();
  const lastSunMarch = lastSunday(year, 2); // month index 2 = March
  const lastSunOct = lastSunday(year, 9);   // month index 9 = October
  return date >= lastSunMarch && date < lastSunOct;
}

function lastSunday(year, month) {
  // Find the last Sunday of a given month (0-indexed)
  const d = new Date(Date.UTC(year, month + 1, 0)); // last day of month
  d.setUTCDate(d.getUTCDate() - d.getUTCDay()); // roll back to Sunday
  d.setUTCHours(1, 0, 0, 0); // clocks change at 02:00 local = 01:00 UTC
  return d;
}