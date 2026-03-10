const fs = require('fs');
const path = require('path');

const bibleDir = path.join(__dirname, '../public/bible');

// Deuterocanon files mapping: filename → bookCode
const deuterocanonFiles = {
  'tob.json': 'tob', 'jdt.json': 'jdt', 'wis.json': 'wis',
  'sir.json': 'sir', 'bar.json': 'bar', '1ma.json': '1ma', '2ma.json': '2ma',
  '3ma.json': '3ma', '4ma.json': '4ma', 'man.json': 'man',
  '1es.json': '1es', '2es.json': '2es', 'esg.json': 'esg',
  'lje.json': 'lje', 's3y.json': 's3y', 'sus.json': 'sus', 'bel.json': 'bel'
};

console.log('🔄 Converting Deuterocanon format...\n');

Object.entries(deuterocanonFiles).forEach(([filename, bookCode]) => {
  const filePath = path.join(bibleDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  Missing:', filename);
    return;
  }
  
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Check if already in correct format {"tob": {...}}
    if (raw[bookCode] && typeof raw[bookCode] === 'object' && !Array.isArray(raw[bookCode])) {
      console.log('✓ Already correct:', bookCode);
      return;
    }
    
    // Convert from "books" array format
    let converted = {};
    
    if (raw.books && Array.isArray(raw.books) && raw.books[0]?.chapters) {
      const book = raw.books[0];
      converted[bookCode] = {};
      
      book.chapters.forEach(ch => {
        const chapterNum = String(ch.chapter);
        converted[bookCode][chapterNum] = (ch.verses || []).map(v => ({
          verse: v.verse,
          text: (v.text || '').trim()
        }));
      });
      
      // Save converted format
      fs.writeFileSync(filePath, JSON.stringify(converted, null, 2));
      console.log('✓ Converted:', bookCode, '(' + Object.keys(converted[bookCode]).length, 'chapters)');
      
    } else if (raw.chapters) {
      // Direct chapters format
      converted[bookCode] = {};
      raw.chapters.forEach(ch => {
        const chapterNum = String(ch.chapter || ch.number);
        converted[bookCode][chapterNum] = (ch.verses || []).map(v => ({
          verse: v.verse || v.number,
          text: (v.text || '').trim()
        }));
      });
      fs.writeFileSync(filePath, JSON.stringify(converted, null, 2));
      console.log('✓ Converted:', bookCode, '(direct chapters)');
      
    } else {
      console.log('⚠️  Unknown format:', filename);
    }
    
  } catch (error) {
    console.log('❌ Error:', filename, '-', error.message);
  }
});

console.log('\n✨ Format conversion complete!');
