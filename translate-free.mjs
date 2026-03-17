import fs from 'fs';
const HF_KEY = process.env.HF_TOKEN;
const DIR = 'public/bible/split';
if (!HF_KEY) { console.error('❌ export HF_TOKEN="hf_..." karo'); process.exit(1); }

async function translate(texts) {
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch('https://router.huggingface.co/hf-inference/models/Helsinki-NLP/opus-mt-en-hi',{
        method:'POST',
        headers:{'Authorization':'Bearer '+HF_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({inputs:texts}),
        signal:AbortSignal.timeout(45000)
      });
      if (!r.ok) throw new Error(r.status);
      const d = await r.json();
      if (Array.isArray(d)) return d.map(x => x.translation_text||'');
      throw new Error('bad');
    } catch(e) {
      if (a===2) return texts;
      await new Promise(r=>setTimeout(r,1000*(a+1)));
    }
  }
  return texts;
}

async function doFile(f) {
  const src=`${DIR}/${f}`, tgt=`${DIR}/hin-${f}`;
  if (!fs.existsSync(src)) return 'skip';
  const data=JSON.parse(fs.readFileSync(src,'utf8'));
  const verses=data.verses;
  if (!verses?.length) return 'skip';
  const hi=/[\u0900-\u097F]/;

  // Existing Hindi verses load karo
  let ex={};
  if (fs.existsSync(tgt)) {
    try {
      const d=JSON.parse(fs.readFileSync(tgt,'utf8'));
      // FIXED: verse number ko string aur number dono se match karo
      (d.verses||[]).forEach(v=>{
        if(hi.test(v.text)){
          ex[v.verse]=v.text;
          ex[String(v.verse)]=v.text;
          ex[Number(v.verse)]=v.text;
        }
      });
    } catch(e){}
  }

  // FIXED: verse number match karo properly
  const need=verses.filter(v=> !ex[v.verse] && !ex[String(v.verse)] && !ex[Number(v.verse)]);
  if (!need.length) return 'cached';

  const out=verses.map(v=>({...v, text: ex[v.verse]||ex[String(v.verse)]||ex[Number(v.verse)]||v.text}));

  for (let i=0; i<need.length; i+=50) {
    const batch=need.slice(i,i+50);
    const res=await translate(batch.map(v=>v.text));
    res.forEach((t,j)=>{
      if(!t||j>=batch.length) return;
      const idx=out.findIndex(v=>v.verse===batch[j].verse);
      if(idx!==-1) out[idx]={...batch[j], text:t};
    });
  }

  fs.writeFileSync(tgt, JSON.stringify({...data, verses:out}, null, 2));
  return 'ok:'+need.length;
}

let isExiting=false;
process.on('SIGINT',()=>{
  if(isExiting) return;
  isExiting=true;
  console.log('\n💾 Progress saved! Dobara: node translate-free.mjs');
  process.exit(0);
});

async function worker(queue,files,stats) {
  while(queue.length>0 && !isExiting){
    const f=queue.shift();
    if(!f) break;
    const r=await doFile(f);
    stats.done++;
    if(r.startsWith('ok')) stats.tv+=parseInt(r.split(':')[1]);
    const p=Math.round(stats.done/files.length*100);
    const b='█'.repeat(Math.floor(p/5))+'░'.repeat(20-Math.floor(p/5));
    const ic=r==='cached'?'⏭️ ':r.startsWith('ok')?'✅':'❌';
    process.stdout.write(`\r[${b}] ${p}% | ${stats.done}/${files.length} | ${ic} ${f.padEnd(20)} | ${stats.tv} verses`);
  }
}

async function main() {
  const files=fs.readdirSync(DIR)
    .filter(f=>f.endsWith('.json')&&f!=='index.json'&&!/^(hin|spa|fra|tam|tel|eng)-/.test(f))
    .sort();

  const hi=/[\u0900-\u097F]/;
  let fullyDone=0, partial=0, notDone=0;

  files.forEach(f=>{
    const tgt=`${DIR}/hin-${f}`;
    if(fs.existsSync(tgt)){
      const d=JSON.parse(fs.readFileSync(tgt,'utf8'));
      const verses=d.verses||[];
      const hindiCount=verses.filter(v=>hi.test(v.text)).length;
      if(hindiCount===verses.length) fullyDone++;
      else if(hindiCount>0) partial++;
      else notDone++;
    } else notDone++;
  });

  console.log(`\n🚀 Divine Bible — Smart Translator`);
  console.log(`📚 Total files  : ${files.length}`);
  console.log(`✅ Fully done   : ${fullyDone} files`);
  console.log(`⚠️  Partial      : ${partial} files`);
  console.log(`❌ Not done     : ${notDone} files`);
  console.log(`\nStarting...\n`);

  const queue=[...files], stats={done:0, tv:0};
  await Promise.all([
    worker(queue,files,stats),
    worker(queue,files,stats),
    worker(queue,files,stats)
  ]);

  // Final count
  let h=0, e=0;
  fs.readdirSync(DIR).filter(f=>f.startsWith('hin-')).forEach(f=>{
    const d=JSON.parse(fs.readFileSync(`${DIR}/${f}`,'utf8'));
    (d.verses||[]).forEach(v=>{ hi.test(v.text)?h++:e++; });
  });

  console.log(`\n\n🎉 COMPLETE!`);
  console.log(`✅ Newly translated : ${stats.tv} verses`);
  console.log(`📊 Total Hindi      : ${h} verses`);
  console.log(`❌ Still English    : ${e} verses`);
  console.log(`📈 Progress         : ${Math.round(h/(h+e)*100)}%`);
  console.log(`\n💾 git add -A && git commit -m "Hindi ${h} verses" && git push\n`);
}

main().catch(e=>{console.error('❌',e.message);process.exit(1);});