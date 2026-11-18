const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'images');
fs.mkdirSync(outDir, { recursive: true });

const W = 48;
const H = 48;
const cx = W / 2;
const cy = H / 2;
const r = 18;

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xEDB88320 & (-(crc & 1)));
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcInput);
  return Buffer.concat([
    len,
    Buffer.from(type, 'ascii'),
    data,
    Buffer.from([(crc >>> 24) & 0xff, (crc >>> 16) & 0xff, (crc >>> 8) & 0xff, crc & 0xff]),
  ]);
}

function makePng(fillRgb, drawExtra) {
  const bytes = [];
  for (let y = 0; y < H; y++) {
    bytes.push(0); // filter byte
    for (let x = 0; x < W; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const extra = drawExtra ? drawExtra(x, y) : null;
      if (extra) {
        bytes.push(extra[0], extra[1], extra[2], 255);
      } else if (dx * dx + dy * dy <= r * r) {
        bytes.push(fillRgb[0], fillRgb[1], fillRgb[2], 255);
      } else {
        bytes.push(0, 0, 0, 0);
      }
    }
  }
  const raw = Buffer.from(bytes);
  const compressed = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

// White letter/symbol drawers on top of brand circle
function drawF(x, y) {
  // simple 'f' shape
  const fx0 = cx - 5, fx1 = cx + 3;
  const fy0 = cy - 10, fy1 = cy + 10;
  if (x >= fx0 && x <= fx1 && y >= fy0 && y <= fy1) {
    // vertical stroke
    if (x === fx0 + 1 || x === fx0 + 2) return [255, 255, 255];
    // middle bar
    if (y >= cy - 2 && y <= cy && x >= fx0 && x <= fx0 + 4) return [255, 255, 255];
    // top curve approximation
    if (y >= fy0 && y <= fy0 + 4 && x >= fx0 && x <= fx0 + 5) return [255, 255, 255];
  }
  return null;
}
function drawXmark(x, y) {
  // X shape
  const dx = x - cx;
  const dy = y - cy;
  const d1 = Math.abs(dx + dy);
  const d2 = Math.abs(dx - dy);
  if (d1 <= 2 || d2 <= 2) return [255, 255, 255];
  return null;
}
function drawIn(x, y) {
  // "in" letters
  const lx0 = cx - 7, lx1 = cx - 2;
  const rx0 = cx + 1, rx1 = cx + 6;
  const fy0 = cy - 8, fy1 = cy + 8;
  if (y >= fy0 && y <= fy1) {
    if (x === lx0 || x === lx1) return [255, 255, 255];
    if (y === fy0 || y === fy1) {
      if (x >= lx0 && x <= lx1) return [255, 255, 255];
      if (x >= rx0 && x <= rx1) return [255, 255, 255];
    }
    if (x >= rx0 && x <= rx0 + 1) return [255, 255, 255];
    if (y === cy && x >= rx0 && x <= rx1) return [255, 255, 255];
  }
  return null;
}
function drawPhone(x, y) {
  // phone handset shape (simplified)
  const dx = x - cx;
  const dy = y - cy;
  if (Math.abs(dx) <= 10 && Math.abs(dy) <= 6) return [255, 255, 255];
  if (Math.abs(dx) <= 6 && Math.abs(dy) <= 10) return [255, 255, 255];
  return null;
}

const icons = [
  { name: 'facebook.png', color: [24, 119, 242], draw: drawF },
  { name: 'x.png', color: [0, 0, 0], draw: drawXmark },
  { name: 'linkedin.png', color: [10, 102, 194], draw: drawIn },
  { name: 'whatsapp.png', color: [37, 211, 102], draw: drawPhone },
];

for (const { name, color, draw } of icons) {
  const png = makePng(color, draw);
  fs.writeFileSync(path.join(outDir, name), png);
  console.log('wrote', name, png.length, 'bytes');
}
