const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const ANY_IMG = /https:\/\/lh3\.googleusercontent\.com\/sitesv\/[^"')\\]+/g;

function normalize(url) {
  return url.replace(/=w\d+(-h\d+)?.*$/, '=w1280').replace(/; background-size: cover;$/, '');
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(dest);
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://sites.google.com/', Accept: 'image/*' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(fs.statSync(dest).size);
      });
    }).on('error', reject);
  });
}

async function main() {
  const html = await fetchPage('https://sites.google.com/view/hugstoelders/photo-gallery');
  const start = html.indexOf('Care Package Making Journey');
  const slice = html.slice(start);

  const sectionDefs = [
    { title: 'Care Package Making Journey', find: 'Care Package Making Journey', pos: 0 },
    { title: 'December 7th Care Packages + Letter Making (Winter Edition)', find: 'December 7th' },
    { title: 'September 14th — Care Packages + Letter Making for UCSF Senior Patients', find: 'September 14th' },
    { title: 'November 15th, 2025 @ West Portal', find: 'November 15th, 2025' },
    { title: 'July 4th, 2025 @ 9th & Irving', find: 'July 4th, 2025' },
    { title: 'June 6th, 2025 @ 9th & Irving', find: 'June 6th, 2025' }
  ].map((s) => ({ ...s, pos: s.pos ?? slice.indexOf(s.find) }));

  const hits = [];
  const seen = new Set();
  for (const m of slice.matchAll(ANY_IMG)) {
    const url = normalize(m[0]);
    if (seen.has(url)) continue;
    seen.add(url);
    hits.push({ url, pos: m.index });
  }

  function sectionForPos(pos) {
    let current = sectionDefs[0];
    for (const s of sectionDefs) {
      if (s.pos >= 0 && pos >= s.pos) current = s;
    }
    return current.title;
  }

  const grouped = {};
  const mapping = [];

  for (let i = 0; i < hits.length; i++) {
    const hit = hits[i];
    const title = sectionForPos(hit.pos);
    const src = `images/gallery/photo-${String(i + 1).padStart(2, '0')}.jpg`;
    if (!grouped[title]) grouped[title] = [];
    grouped[title].push({ src });
    mapping.push({ index: i + 1, section: title, url: hit.url });

    const dest = path.join(ROOT, src);
    try {
      const size = await downloadImage(hit.url, dest);
      console.log(`OK ${src} (${size} bytes) — ${title}`);
    } catch (err) {
      console.error(`FAIL ${src}:`, err.message);
    }
  }

  const albums = sectionDefs
    .map((s) => s.title)
    .filter((t) => grouped[t]?.length)
    .map((title) => ({ title, photos: grouped[title] }));

  fs.writeFileSync(path.join(ROOT, 'js', 'gallery-data.json'), JSON.stringify(albums, null, 2));
  fs.writeFileSync(path.join(ROOT, 'images', 'gallery-manifest.json'), JSON.stringify({ total: hits.length, mapping }, null, 2));
  console.log('\nAlbums:', albums.map((a) => `${a.title} (${a.photos.length})`).join('\n'));
}

main().catch(console.error);
