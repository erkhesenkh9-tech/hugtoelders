const https = require('https');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const html = await fetchPage('https://sites.google.com/view/hugstoelders/home');

  const markers = [
    'Welcome!',
    'H2E\'s First Bake Sale',
    'UCSF Care Package Delivery',
    'Featured in UCSF GeriNews',
    'In September, we delivered',
    'Coming Soon!',
    'Care Packages for Seniors',
    'Letters from H2E',
    'Letter Making Event',
    'Contact Us'
  ];
  for (const m of markers) console.log(m, html.indexOf(m));

  // Extract visible text chunks between image tags in welcome area
  const start = html.indexOf('Welcome!');
  const end = html.indexOf('Coming Soon!');
  const chunk = html.slice(start, end);
  const textBits = chunk
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && s.length < 120);
  console.log('\nText bits in welcome area:');
  [...new Set(textBits)].forEach((t) => console.log('-', t));
}

main().catch(console.error);
