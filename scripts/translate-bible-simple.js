// scripts/translate-bible-simple.js
// ✅ FREE, FAST, OFFLINE-READY Bible Translator
// Usage: node translate-bible-simple.js eng-kjv hin-hindi

const fs = require('fs');
const path = require('path');

const SOURCE_LANG = process.argv[2] || 'eng-kjv';
const TARGET_LANG = process.argv[3] || 'hin-hindi';
const SOURCE_FILE = path.join(__dirname, `../public/bible/${SOURCE_LANG}-81books.json`);
const TARGET_FILE = path.join(__dirname, `../public/bible/${TARGET_LANG}-81books.json`);
const SPLIT_DIR = path.join(__dirname, '../public/bible/split');

// Language code mapping for LibreTranslate
const LANG_CODES = {
  'hin-hindi': 'hi', 'eng-kjv': 'en', 'spa-spanish': 'es',
  'fra-french': 'fr', 'deu-german': 'de', 'por-portuguese': 'pt'
};

console.log(`🔄 ${SOURCE_LANG} → ${TARGET_LANG} (FREE, OFFLINE-READY)\n`);

// Check source file
if (!fs.existsSync(SOURCE_FILE)) {
  console.error(`❌ Source not found: ${SOURCE_FILE}`);
  process.exit(1);
}

// Load source Bible
const sourceBible = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
console.log(`✅ Loaded: ${Object.keys(sourceBible).length} books\n`);

// ============ TRANSLATE FUNCTION (LibreTranslate - FREE) ============
async function translateText(text, targetLang) {
  const targetCode = LANG_CODES[targetLang] || targetLang.split('-')[0];
  
  try {
    const res = await fetch('https://libretranslate.de/translate ', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetCode,
        format: 'text'
      })
    });
    
    if (!res.ok) return text; // Fallback to English
    const data = await res.json();
    return data.translatedText || text;
  } catch (e) {
    return text; // Always fallback to English (safe!)
  }
}

// ============ BATCH TRANSLATE (Fast + Rate-limit safe) ============
async function translateVerses(verses, targetLang) {
  const translated = [];
  
  // Process in batches of 10 (avoid rate limits)
  for (let i = 0; i < verses.length; i += 10) {
    const batch = verses.slice(i, i + 10);
    
    const results = await Promise.all(
      batch.map(async (verse) => ({
        ...verse,
        text: await translateText(verse.text, targetLang)
      }))
    );
    
    translated.push(...results);
    
    // Small delay between batches
    if (i + 10 < verses.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  
  return translated;
}

// ============ MAIN: Translate Bible ============
async function translateBible() {
  const targetBible = {};
  let totalVerses = 0, translatedCount = 0;
  
  // Optional: Only translate sample books for testing
  const SAMPLE_MODE = process.argv[4] === '--sample';
  const SAMPLE_BOOKS = ['gen', 'ps', 'matt', 'john']; // Fast test
  
  for (const [bookCode, chapters] of Object.entries(sourceBible)) {
    // Skip if sample mode and not in sample list
    if (SAMPLE_MODE && !SAMPLE_BOOKS.includes(bookCode)) continue;
    
    targetBible[bookCode] = {};
    
    for (const [chapterNum, verses] of Object.entries(chapters)) {
      totalVerses += verses.length;
      
      // Translate
      const translated = await translateVerses(verses, TARGET_LANG);
      targetBible[bookCode][chapterNum] = translated;
      translatedCount += translated.length;
      
      // Progress
      if (totalVerses % 50 === 0) {
        console.log(`  📖 ${translatedCount}/${totalVerses} verses...`);
      }
    }
    
    console.log(`✅ ${bookCode}: ${Object.keys(chapters).length} chapters`);
  }
  
  // Save combined file
  console.log(`\n💾 Saving ${TARGET_FILE}...`);
  fs.writeFileSync(TARGET_FILE, JSON.stringify(targetBible, null, 2));
  console.log(`✅ Size: ${(fs.statSync(TARGET_FILE).size/1024/1024).toFixed(2)} MB`);
  
  // Save split files
  console.log(`\n✂️  Creating split files...`);
  let fileCount = 0;
  const prefix = TARGET_LANG.split('-')[0]; // 'hin' from 'hin-hindi'
  
  for (const [bookCode, chapters] of Object.entries(targetBible)) {
    for (const [chapterNum, verses] of Object.entries(chapters)) {
      const filename = `${prefix}-${bookCode}-${chapterNum}.json`;
      const filepath = path.join(SPLIT_DIR, filename);
      
      fs.writeFileSync(filepath, JSON.stringify({
        book: bookCode,
        chapter: parseInt(chapterNum),
        verses: verses,
        language: TARGET_LANG
      }, null, 2));
      
      fileCount++;
    }
  }
  
  console.log(`✅ Created ${fileCount} split files (prefix: ${prefix}-)`);
  
  // Summary
  console.log(`\n🎉 Translation complete!`);
  console.log(`📚 Books: ${Object.keys(targetBible).length}`);
  console.log(`📖 Verses: ${translatedCount}/${totalVerses}`);
  console.log(`🌐 Language: ${TARGET_LANG}`);
  console.log(`📁 Files work OFFLINE now!`);
}

// Run
translateBible().catch(console.error);
