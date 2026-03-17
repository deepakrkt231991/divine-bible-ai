const { Translate } = require('@google-cloud/translate').v2;
const fs = require('fs');

const translate = new Translate({ key: process.env.GOOGLE_API_KEY });

async function translateFile(file) {
  const data = JSON.parse(fs.readFileSync(file));
  for (let v of data.verses) {
    if (!v.text.match(/[आ-ह]/)) { // Skip if already Hindi
      const [t] = await translate.translate(v.text, 'hi');
      v.text = t;
    }
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Run for all Hindi files
const files = fs.readdirSync('public/bible/split').filter(f => f.startsWith('hin-'));
for (const f of files) await translateFile(`public/bible/split/${f}`);
console.log('✅ Done!');
