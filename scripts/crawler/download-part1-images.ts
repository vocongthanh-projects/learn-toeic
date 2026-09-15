import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const IMAGES = [
  'access-badge-ai-v5.jpg',
  'airport.jpg',
  'barcode-ai-v3.jpg',
  'bicycle-lock-ai-v5.jpg',
  'cable-coil-ai-v5.jpg',
  'cafe-chairs-ai-v4.jpg',
  'construction.jpg',
  'delivery.jpg',
  'ev-charging-ai-v4.jpg',
  'high-shelf-ai-v4.jpg',
  'housekeeping-ai-v4.jpg',
  'library-cart-ai-v5.jpg',
  'meeting-ai-v2.jpg',
  'package-tape-ai-v5.jpg',
  'plants-ai-v3.jpg',
  'printer-ai-v2.jpg',
  'reception-ai-v3.jpg',
  'restaurant-ai-v2.jpg',
  'solar-ai-v3.jpg',
  'station.jpg',
  'thermostat-ai-v5.jpg',
  'training-room-ai-v5.jpg',
  'transit-map-ai-v4.jpg',
  'warehouse.jpg',
  'window-measure-ai-v4.jpg'
];

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const publicPart1Dir = path.resolve(process.cwd(), 'public/assets/part1');
  if (!fs.existsSync(publicPart1Dir)) {
    fs.mkdirSync(publicPart1Dir, { recursive: true });
  }

  console.log(`Downloading ${IMAGES.length} Part 1 photos from GitHub kdeppaei/toeic-question-ocean...`);
  
  for (const img of IMAGES) {
    const url = `https://raw.githubusercontent.com/kdeppaei/toeic-question-ocean/main/assets/part1/${img}`;
    const dest = path.join(publicPart1Dir, img);
    try {
      await downloadFile(url, dest);
      const stat = fs.statSync(dest);
      console.log(`  ✓ Downloaded ${img} (${(stat.size / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
      console.error(`  ✗ Error downloading ${img}:`, err.message);
    }
  }

  console.log('\nAll 25 authentic Part 1 photos downloaded and verified directly from GitHub!');
}

main().catch(console.error);

