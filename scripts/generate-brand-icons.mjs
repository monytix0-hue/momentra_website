import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "public", "favicon.svg"));

async function writePng(size, relPath) {
  const path = join(root, relPath);
  await sharp(svg).resize(size, size).png().toFile(path);
  console.log("wrote", relPath, size);
}

await writePng(32, "public/favicon-32.png");
await writePng(48, "public/favicon-48.png");
await writePng(180, "app/apple-icon.png");
await writePng(512, "app/icon.png");
await writePng(512, "public/icon-512.png");

const iconPng = await sharp(svg).resize(280, 280).png().toBuffer();
const ogSvg = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1A1238"/>
      <stop offset="100%" stop-color="#2D1F5E"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="520" y="290" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" fill="#F5F0FF">Momentra</text>
  <text x="520" y="360" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="#C4B5E8">Life Happens in Moments</text>
</svg>`);
const base = await sharp(ogSvg).png().toBuffer();
const og = await sharp(base)
  .composite([{ input: iconPng, left: 160, top: 175 }])
  .png()
  .toBuffer();

writeFileSync(join(root, "public", "og-image.png"), og);
writeFileSync(join(root, "app", "opengraph-image.png"), og);
console.log("wrote public/og-image.png + app/opengraph-image.png");

/** Build a multi-size .ico that embeds PNG payloads (Vista+). */
function pngsToIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];
  for (const png of pngBuffers) {
    entries.push({ png, offset, bytes: png.length });
    offset += png.length;
  }
  const out = Buffer.alloc(offset);
  out.writeUInt16LE(0, 0);
  out.writeUInt16LE(1, 2);
  out.writeUInt16LE(count, 4);
  let entryOffset = 6;
  for (let i = 0; i < count; i++) {
    const meta = pngBuffers[i];
    // width/height 0 means 256 in ICO; we use 32/48 from known sizes
    const wh = i === 0 ? 32 : 48;
    out.writeUInt8(wh === 256 ? 0 : wh, entryOffset);
    out.writeUInt8(wh === 256 ? 0 : wh, entryOffset + 1);
    out.writeUInt8(0, entryOffset + 2);
    out.writeUInt8(0, entryOffset + 3);
    out.writeUInt16LE(1, entryOffset + 4);
    out.writeUInt16LE(32, entryOffset + 6);
    out.writeUInt32LE(meta.length, entryOffset + 8);
    out.writeUInt32LE(entries[i].offset, entryOffset + 12);
    entryOffset += 16;
  }
  for (let i = 0; i < count; i++) {
    pngBuffers[i].copy(out, entries[i].offset);
  }
  return out;
}

const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
const png48 = await sharp(svg).resize(48, 48).png().toBuffer();
const ico = pngsToIco([png32, png48]);
writeFileSync(join(root, "app", "favicon.ico"), ico);
writeFileSync(join(root, "public", "favicon.ico"), ico);
console.log("wrote favicon.ico", ico.length, "bytes");
