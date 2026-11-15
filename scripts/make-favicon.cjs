/* Wrap a PNG into a valid .ico container (PNG-in-ICO, supported since Vista).
 * Usage: node scripts/make-favicon.cjs <input.png> <output.ico>
 */
const fs = require('fs');

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error('Usage: node scripts/make-favicon.cjs <input.png> <output.ico>');
  process.exit(1);
}

const png = fs.readFileSync(input);
if (png.readUInt32BE(0) !== 0x89504e47) {
  console.error('Input is not a PNG');
  process.exit(1);
}

// Read width/height from IHDR (bytes 16-23)
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);

// ICO header: reserved(2)=0, type(2)=1 (icon), count(2)=1
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);

// Directory entry (16 bytes): w, h, colors, reserved, planes, bitcount, size, offset
const entry = Buffer.alloc(16);
entry.writeUInt8(width >= 256 ? 0 : width, 0);
entry.writeUInt8(height >= 256 ? 0 : height, 1);
entry.writeUInt8(0, 2); // colors
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // planes
entry.writeUInt16LE(32, 6); // bitcount
entry.writeUInt32LE(png.length, 8);
entry.writeUInt32LE(6 + 16, 12); // offset

fs.writeFileSync(output, Buffer.concat([header, entry, png]));
console.log(`Wrote ${output} (${width}x${height}, ${png.length} bytes png)`);
