const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const IMG = /https:\/\/lh3\.googleusercontent\.com\/sitesv\/[^"')\\]+/g;

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function normalize(url) {
  return url.replace(/=w\d+(-h\d+)?.*$/, '=w1280');
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://sites.google.com/' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
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
  const html = await fetchPage('https://sites.google.com/view/hugstoelders/home');
  const start = html.indexOf('Welcome!');
  const end = html.indexOf('In September, we delivered');
  const slice = html.slice(start, end);

  const seen = new Set();
  const urls = [];
  for (const m of slice.matchAll(IMG)) {
    const url = normalize(m[0]);
    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  console.log('Welcome section images:', urls.length);
  urls.forEach((u, i) => console.log(i + 1, u.slice(-35)));

  const welcomeCards = [
    { slug: 'bake-sale-9th-irving', caption: "H2E's First Bake Sale @ 9th & Irving" },
    { slug: 'ucsf-care-package', caption: 'UCSF Care Package Delivery' },
    { slug: 'ucsf-gerinews', caption: 'Featured in UCSF GeriNews' }
  ];

  fs.mkdirSync(path.join(ROOT, 'images', 'home'), { recursive: true });

  const manifest = [];
  for (let i = 0; i < welcomeCards.length; i++) {
    const card = welcomeCards[i];
    const url = urls[i];
    if (!url) {
      console.log('Missing URL for', card.slug);
      continue;
    }
    const dest = path.join(ROOT, 'images', 'home', `${card.slug}.jpg`);
    const size = await download(url, dest);
    console.log(`OK ${card.slug}.jpg (${size}b)`);
    manifest.push({ ...card, src: `images/home/${card.slug}.jpg` });
  }

  // Coming Soon carousel images
  const comingStart = html.indexOf('Coming Soon!');
  const comingEnd = html.indexOf('Contact Us');
  const comingSlice = html.slice(comingStart, comingEnd);
  const comingLabels = [
    { slug: 'care-packages-seniors', find: 'Care Packages for Seniors' },
    { slug: 'letters-from-h2e', find: 'Letters from H2E' },
    { slug: 'letter-making', find: 'Letter Making Event' },
    { slug: 'first-volunteering', find: '1st Volunteering Event' },
    { slug: 'bracelet-making', find: 'Bracelet making' },
    { slug: 'origami-seniors', find: 'Making Origami' },
    { slug: 'bake-sale', find: 'Bake Sale!' },
    { slug: 'bake-sale-goodies', find: 'Bake Sale Goodies' }
  ];

  const seen2 = new Set();
  const carouselUrls = [];
  for (const m of comingSlice.matchAll(IMG)) {
    const url = normalize(m[0]);
    if (!seen2.has(url)) {
      seen2.add(url);
      carouselUrls.push(url);
    }
  }
  console.log('\nCarousel images:', carouselUrls.length);

  const comingSoon = [];
  for (let i = 0; i < comingLabels.length && i < carouselUrls.length; i++) {
    const item = comingLabels[i];
    const dest = path.join(ROOT, 'images', 'home', `${item.slug}.jpg`);
    const size = await download(carouselUrls[i], dest);
    console.log(`OK ${item.slug}.jpg (${size}b)`);
    comingSoon.push({
      slug: item.slug,
      caption: item.find,
      src: `images/home/${item.slug}.jpg`
    });
  }

  fs.writeFileSync(path.join(ROOT, 'js', 'home-images.json'), JSON.stringify({ welcome: manifest, comingSoon }, null, 2));
}

main().catch(console.error);
