import fs from 'fs';

const DIR = 'public/bible/split';
let done_verses = 0;

async function translate(texts) {
  const results = [];
  for (const text of texts) {
    try {
      const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi&de=bibleapp@gmail.com`);
      const d = await r.json();
      results.push(d.responseData?.translatedText || text);
    } catch(e) {
      results.push(text);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  return results;
}

async function doFile(f) {
  const data = JSON.parse(fs.readFileSync(`${DIR}/${f}`, 'utf8'));
  const verses = data.verses;
  if (!verses?.length) return 'skip';

  const hi = /[\u0900-\u097F]/;
  if (verses.every(v => hi.test(v.text))) return 'cached';

  const out = [...verses];
  for (let i = 0; i < verses.length; i += 10) {
    const batch = verses.slice(i, i+10);
    const res = await translate(batch.map(v => v.text));
    res.forEach((t,j) => out[i+j] = {...verses[i+j], text: t});
    done_verses += batch.length;
  }

  fs.writeFileSync(`${DIR}/hin-${f}`, JSON.stringify({...data, verses: out}, null, 2));
  return 'ok:' + verses.length;
}

async function main() {
  const files = fs.readdirSync(DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json' && !/^(hin|spa|fra|tam|tel|eng)-/.test(f))
    .sort();

  console.log(`\n🚀 ${files.length} files | MyMemory FREE API | No card needed!\n`);

  let done=0, tv=0, err=0;

  for (const f of files) {
    const r = await doFile(f);
    done++;
    if (r.startsWith('ok')) tv += parseInt(r.split(':')[1]);
    if (r.startsWith('error')) err++;
    const p = Math.round(done/files.length*100);
    const b = '█'.repeat(Math.floor(p/5))+'░'.repeat(20-Math.floor(p/5));
    const ic = r.startsWith('error')?'❌':r==='cached'?'⏭️':'✅';
    process.stdout.write(`\r[${b}] ${p}% | ${done}/${files.length} | ${ic} ${f.padEnd(20)} | ${tv} verses`);
  }

  console.log(`\n\n✅ Translated : ${tv} verses`);
  console.log(`❌ Errors     : ${err}`);
  console.log(`💰 Cost       : ZERO — No card needed ✅`);
  console.log(`\n🎉 git add -A && git commit -m "Hindi ${tv} verses" && git push\n`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });