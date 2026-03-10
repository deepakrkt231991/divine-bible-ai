const fs = require('fs');
const path = require('path');

const bibleDir = path.join(__dirname, '../public/bible');
const inputFile = path.join(bibleDir, 'eng-web-osis.json');
const outputFile = path.join(bibleDir, 'eng-web-osis-80books.json');

// All Deuterocanon book codes
const allDeuterocanon = ['tob','jdt','wis','sir','bar','1ma','2ma','3ma','4ma','man','1es','2es','esg','lje','s3y','sus','bel'];

console.log('🔗 Combining Protestant + Deuterocanon for 80+ books...\n');

// Load Protestant Bible (66 books)
const bible = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
console.log('📚 Protestant books:', Object.keys(bible).length);

// Add available Deuterocanon books
let added = 0;
allDeuterocanon.forEach(code => {
  const deuterFile = path.join(bibleDir, code + '.json');
  if (fs.existsSync(deuterFile)) {
    const deuterContent = JSON.parse(fs.readFileSync(deuterFile, 'utf8'));
    const bookCode = Object.keys(deuterContent)[0];
    if (bookCode && !bible[bookCode]) {
      bible[bookCode] = deuterContent[bookCode];
      added++;
      console.log('  ✓ Added:', code);
    }
  } else {
    console.log('  ⚠️  Missing:', code + '.json');
  }
});

// Save combined file
fs.writeFileSync(outputFile, JSON.stringify(bible, null, 2));

console.log('\n✅ Saved:', outputFile);
console.log('📚 Total Books:', Object.keys(bible).length);
console.log('🔍 Deuterocanon Added:', added, '/17 available');
