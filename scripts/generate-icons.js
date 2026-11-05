import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(size, isMaskable = false) {
  const width = size;
  const height = size;
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data: filter byte (0) + 4 bytes per pixel per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.45;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default dark background #09090b
      let r = 9, g = 9, b = 11, a = 255;

      // Hexagon / Rounded badge or center icon
      if (dist < radius) {
        // Subtle emerald pulse / health cross / heartbeat glow
        // Heartbeat / lightning / pulse line in center
        const inHeart = (Math.abs(y - cy) < size * 0.08 && Math.abs(x - cx) < size * 0.3) ||
                        (Math.abs(x - cx) < size * 0.08 && Math.abs(y - cy) < size * 0.3);
        
        // Inner circle ring
        if (Math.abs(dist - radius * 0.8) < size * 0.04) {
          // Ring color: Emerald (#10b981)
          r = 16; g = 185; b = 129;
        } else if (inHeart) {
          // Center Medical Cross / Vital icon (#34d399)
          r = 52; g = 211; b = 153;
        } else if (dist < radius * 0.8) {
          // Inner badge dark slate (#18181b)
          r = 24; g = 24; b = 27;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([pngHeader, ihdr, idat, iend]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180));

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="128" fill="#09090b"/>
  <circle cx="256" cy="256" r="180" fill="#18181b" stroke="#10b981" stroke-width="16"/>
  <path d="M256 160 v192 M160 256 h192" stroke="#34d399" stroke-width="36" stroke-linecap="round"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('Successfully generated PWA icon assets!');
