import fs from 'fs';
import path from 'path';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SPLIT_DIR      = path.join(process.cwd(), 'public', 'bible', 'split');
const TARGET_LANG    = 'hi';
const TARGET_PREFIX  = 'hin';
const WORKERS        = 10;
const BATCH_CHARS    = 4000;

if (!GOOGLE_API_KEY) {
  console.error('❌ Run karo: export GOOGLE_API_KEY="AIza...key..."');
  process.exit(1);
}

async function googleTranslateBatch(texts) {
  if (!texts.length) return [];
  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: texts, source: 'en', target: TARGET_LANG, format: 'text' }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).substring(0,150)}`);
  const data = await res.json();
  return data.data.translations.map(t => t.translatedText);
}

async function translateFile(sourceFile) {
  const sourcePath = path.join(SPLIT_DIR, sourceFile);
  // 1chr-1.json → hin-1chr-1.json
  const targetFile = `${TARGET_PREFIX}-${sourceFile}`;
  const targetPath = path.join(SPLIT_DIR, targetFile);

  let data;
  try { data = JSON.parse(fs.readFileSync(sourcePath, 'utf8')); }
  catch (e) { return { file: sourceFile, error: 'parse error' }; }

  const verses = data.verses || data;
  if (!Array.isArray(verses) || !verses.length) return { file: sourceFile, error: 'no verses' };

  // Already translated verses load karo
  const hindiRegex = /[\u0900-\u097F]/;
  let existingMap  = {};
  if (fs.existsSync(targetPath)) {
    try {
      const ex = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      const ev = ex.verses || ex;
      if (Array.isArray(ev)) ev.forEach(v => { if (hindiRegex.test(v.text)) existingMap[v.verse] = v.text; });
    } catch (e) {}
  }

  const toTranslate = verses.filter(v => !existingMap[v.verse]);
  if (!toTranslate.length) return { file: targetFile, cached: verses.length, translated: 0 };

  // Smart batching
  const batches = [];
  let cur = [], chars = 0;
  for (const v of toTranslate) {
    const len = (v.text || '').length;
    if (chars + len > BATCH_CHARS && cur.length) { batches.push(cur); cur = []; chars = 0; }
    cur.push(v); chars += len;
  }
  if (cur.length) batches.push(cur);

  // Translate with retry
  const translatedMap = { ...existingMap };
  for (const batch of batches) {
    const texts = batch.map(v => v.text || '');
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const results = await googleTranslateBatch(texts);
        results.forEach((t, i) => { translatedMap[batch[i].verse] = t; });
        break;
      } catch (e) {
        if (attempt === 0) await new Promise(r => setTimeout(r, 2000));
        else batch.forEach(v => { translatedMap[v.verse] = v.text; });
      }
    }
  }

  const newVerses = verses.map(v => ({ ...v, text: translatedMap[v.verse] || v.text }));
  const output    = { ...data, verses: newVerses };
  fs.writeFileSync(targetPath, JSON.stringify(output, null, 2), 'utf8');
  return { file: targetFile, translated: toTranslate.length, cached: verses.length - toTranslate.length };
}

async function runParallel(files, workers) {
  const queue = [...files], results = [];
  let active = 0, done = 0;
  return new Promise(resolve => {
    function next() {
      while (active < workers && queue.length) {
        const file = queue.shift();
        active++;
        translateFile(file).then(r => {
          results.push(r);
          active--; done++;
          const pct = Math.round(done / files.length * 100);
          const bar = '█'.repeat(Math.floor(pct/5)) + '░'.repeat(20 - Math.floor(pct/5));
          const ico = r.error ? '❌' : !r.translated ? '⏭️ ' : '✅';
          process.stdout.write(`\r[${bar}] ${pct}% | ${done}/${files.length} | ${ico} ${(r.file||'').substring(0,22).padEnd(22)}`);
          done === files.length ? (console.log(''), resolve(results)) : next();
        }).catch(err => {
          results.push({ file, error: err.message });
          active--; done++;
          done === files.length ? (console.log(''), resolve(results)) : next();
        });
      }
    }
    next();
  });
}

async function main() {
  console.log('\n🚀 Divine Bible AI — Parallel Translator\n');

  if (!fs.existsSync(SPLIT_DIR)) {
    console.error(`❌ Directory nahi mili: ${SPLIT_DIR}`);
    process.exit(1);
  }

  // English source files — no prefix, exclude hin- spa- fra- etc
  const allFiles = fs.readdirSync(SPLIT_DIR)
    .filter(f => {
      if (!f.endsWith('.json')) return false;
      if (f === 'index.json') return false;
      // Koi bhi language prefix wali file skip karo
      if (/^(hin|spa|fra|tam|tel|eng)-/.test(f)) return false;
      return true;
    })
    .sort();

  if (!allFiles.length) {
    console.error('❌ Koi source files nahi mili!');
    console.log('   Sample:', fs.readdirSync(SPLIT_DIR).slice(0,5).join(', '));
    process.exit(1);
  }

  // Stats
  let totalVerses = 0, totalChars = 0;
  allFiles.forEach(f => {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(SPLIT_DIR, f), 'utf8'));
      const v = d.verses || d;
      if (Array.isArray(v)) {
        totalVerses += v.length;
        totalChars  += v.reduce((s, x) => s + (x.text||'').length, 0);
      }
    } catch(e) {}
  });

  const isFree = totalChars <= 500000;
  console.log(`📚 Source files : ${allFiles.length}`);
  console.log(`📖 Total verses : ${totalVerses.toLocaleString()}`);
  console.log(`📝 Characters   : ${totalChars.toLocaleString()} / 500,000 free`);
  console.log(`💰 Cost         : ${isFree ? 'ZERO — Free tier ✅' : '$'+((totalChars-500000)/1000000*20).toFixed(2)}`);
  console.log(`⚡ Workers      : ${WORKERS} parallel`);
  console.log(`\nStarting...\n`);

  const t0      = Date.now();
  const results = await runParallel(allFiles, WORKERS);
  const elapsed = Math.round((Date.now()-t0)/1000);

  const ok      = results.filter(r => !r.error);
  const errs    = results.filter(r => r.error);
  const newDone = ok.reduce((s,r) => s+(r.translated||0), 0);
  const cached  = ok.reduce((s,r) => s+(r.cached||0), 0);

  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  ✅ TRANSLATION COMPLETE!             ║`);
  console.log(`╠══════════════════════════════════════╣`);
  console.log(`║  Translated : ${String(newDone+' verses').padEnd(23)}║`);
  console.log(`║  Cached     : ${String(cached+' verses').padEnd(23)}║`);
  console.log(`║  Errors     : ${String(errs.length).padEnd(23)}║`);
  console.log(`║  Time       : ${String(elapsed+'s').padEnd(23)}║`);
  console.log(`╚══════════════════════════════════════╝`);

  if (errs.length) {
    console.log(`\n❌ Failed (dobara run karo):`);
    errs.slice(0,10).forEach(e => console.log(`   ${e.file}: ${e.error}`));
  }

  console.log(`\n🎉 Deploy karo:`);
  console.log(`   git add -A && git commit -m "✅ Hindi: ${newDone} verses" && git push\n`);
}

main().catch(e => { console.error('\n❌ Fatal:', e.message); process.exit(1); });
