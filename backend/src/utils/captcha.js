const crypto = require('crypto');

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CAPTCHA_LENGTH = 5;
const TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_STORE_SIZE = 5000;

const store = new Map();

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomChar() {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)];
}

function purgeExpired() {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (entry.expiresAt <= now) store.delete(id);
  }
  if (store.size > MAX_STORE_SIZE) {
    const overflow = store.size - MAX_STORE_SIZE;
    let i = 0;
    for (const id of store.keys()) {
      if (i >= overflow) break;
      store.delete(id);
      i += 1;
    }
  }
}

function generateAnswer() {
  let answer = '';
  for (let i = 0; i < CAPTCHA_LENGTH; i += 1) {
    answer += randomChar();
  }
  return answer;
}

function renderSvg(answer) {
  const width = 180;
  const height = 60;
  const charSpacing = (width - 24) / answer.length;

  const palette = ['#66c0f4', '#cfe7ff', '#a4d3ff', '#7fb3e8', '#b9e1ff'];
  const noiseColors = ['rgba(102,192,244,0.35)', 'rgba(204,224,255,0.25)', 'rgba(255,255,255,0.18)'];

  let body = '';

  for (let i = 0; i < 6; i += 1) {
    const x1 = randInt(0, width);
    const y1 = randInt(0, height);
    const x2 = randInt(0, width);
    const y2 = randInt(0, height);
    const stroke = noiseColors[randInt(0, noiseColors.length - 1)];
    const sw = randInt(1, 2);
    body += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" />`;
  }

  for (let i = 0; i < 18; i += 1) {
    const cx = randInt(0, width);
    const cy = randInt(0, height);
    const r = randInt(1, 2);
    body += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,0.18)" />`;
  }

  for (let i = 0; i < answer.length; i += 1) {
    const ch = answer[i];
    const cx = 14 + i * charSpacing + randInt(-3, 3);
    const cy = height / 2 + randInt(-3, 3) + 10;
    const rotate = randInt(-25, 25);
    const fill = palette[randInt(0, palette.length - 1)];
    const fontSize = randInt(28, 34);
    body += `<text x="${cx}" y="${cy}" font-family="Verdana, Tahoma, Geneva, sans-serif" font-size="${fontSize}" font-weight="700" fill="${fill}" transform="rotate(${rotate} ${cx} ${cy})">${ch}</text>`;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Captcha challenge">` +
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#13243a" /><stop offset="100%" stop-color="#0b1220" /></linearGradient></defs>` +
    `<rect width="${width}" height="${height}" fill="url(#bg)" />` +
    body +
    `</svg>`
  );
}

function createCaptcha() {
  purgeExpired();
  const id = crypto.randomBytes(12).toString('hex');
  const answer = generateAnswer();
  store.set(id, { answer, expiresAt: Date.now() + TTL_MS });
  return { id, svg: renderSvg(answer), expiresIn: TTL_MS / 1000 };
}

function verifyCaptcha(id, submittedAnswer) {
  if (!id || typeof id !== 'string') return false;
  if (typeof submittedAnswer !== 'string') return false;
  const entry = store.get(id);
  if (!entry) return false;
  // Single-use: always remove after lookup, regardless of correctness.
  store.delete(id);
  if (entry.expiresAt <= Date.now()) return false;
  return entry.answer.toUpperCase() === submittedAnswer.trim().toUpperCase();
}

module.exports = {
  createCaptcha,
  verifyCaptcha,
};
