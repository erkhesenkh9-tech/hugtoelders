const fs = require('fs');
const path = require('path');
const https = require('https');

const PAGES = [
  { name: 'board', url: 'https://sites.google.com/view/hugstoelders/our-board' },
  { name: 'gallery', url: 'https://sites.google.com/view/hugstoelders/photo-gallery' },
  { name: 'home', url: 'https://sites.google.com/view/hugstoelders/home' },
  { name: 'mission', url: 'https://sites.google.com/view/hugstoelders/mission' }
];

const ROOT = path.join(__dirname, '..');
const IMG_RE = /https:\/\/lh3\.googleusercontent\.com\/sitesv\/[^"')\\]+/g;

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://sites.google.com/',
        'Accept': 'image/*'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const size = fs.statSync(dest).size;
        if (size < 5000) {
          fs.unlinkSync(dest);
          return reject(new Error(`Too small (${size} bytes)`));
        }
        resolve(size);
      });
    }).on('error', reject);
  });
}

function normalizeImageUrl(url) {
  return url.replace(/=w\d+(-h\d+)?.*$/, '=w1280').replace(/; background-size: cover;$/, '');
}

async function main() {
  const boardNames = [
    'aubrey-socarras',
    'fiona-liang',
    'ada-kwan',
    'vickie-yee',
    'anamaria-tapus',
    'laura-ly',
    'kaitlyn-hau',
    'chloe-liang'
  ];

  fs.mkdirSync(path.join(ROOT, 'images', 'board'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'images', 'gallery'), { recursive: true });

  const boardHtml = await fetchPage(PAGES[0].url);
  const boardImgs = [...new Set([...boardHtml.matchAll(IMG_RE)].map((m) => normalizeImageUrl(m[0])))]
    .filter((u) => u.includes('w1280') || !u.includes('='));

  const w1280 = boardImgs.filter((u) => u.endsWith('=w1280'));
  console.log('Board w1280 images found:', w1280.length);

  const boardMap = {};
  for (const name of [
    'Aubrey Socarras', 'Fiona Liang', 'Ada Kwan', 'Vickie Yee',
    'Anamaria Tapus', 'Laura Ly', 'Kaitlyn Hau', 'Chloe Liang'
  ]) {
    const idx = boardHtml.indexOf(name);
    const before = boardHtml.slice(Math.max(0, idx - 1500), idx);
    const imgs = [...before.matchAll(IMG_RE)].map((m) => normalizeImageUrl(m[0]));
    const photo = imgs.filter((u) => u.endsWith('=w1280')).pop();
    if (photo) boardMap[name] = photo;
  }

  for (let i = 0; i < boardNames.length; i++) {
    const slug = boardNames[i];
    const fullName = Object.keys(boardMap)[i];
    const url = boardMap[fullName];
    const dest = path.join(ROOT, 'images', 'board', `${slug}.jpg`);
    try {
      const size = await downloadImage(url, dest);
      console.log(`OK board/${slug}.jpg (${size} bytes)`);
    } catch (err) {
      console.error(`FAIL board/${slug}.jpg:`, err.message);
    }
  }

  const galleryHtml = await fetchPage(PAGES[1].url);
  const galleryImgs = [...new Set([...galleryHtml.matchAll(IMG_RE)].map((m) => normalizeImageUrl(m[0])))]
    .filter((u) => u.endsWith('=w1280'));

  console.log('\nGallery images found:', galleryImgs.length);

  let g = 0;
  for (const url of galleryImgs) {
    g += 1;
    const dest = path.join(ROOT, 'images', 'gallery', `photo-${String(g).padStart(2, '0')}.jpg`);
    try {
      const size = await downloadImage(url, dest);
      console.log(`OK gallery/photo-${String(g).padStart(2, '0')}.jpg (${size} bytes)`);
    } catch (err) {
      console.error(`FAIL gallery photo ${g}:`, err.message);
    }
  }

  fs.writeFileSync(path.join(ROOT, 'images', 'gallery-manifest.json'), JSON.stringify({
    downloaded: g,
    urls: galleryImgs
  }, null, 2));

  console.log('\nDone.');
}

main().catch(console.error);
