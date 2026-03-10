const fs = require('fs');
const path = require('path');
const bibleDir = path.join(__dirname, '../public/bible');
const inputFile = path.join(bibleDir, 'hin-hindi-osis.json');
const outputFile = path.join(bibleDir, 'hin-hindi-osis-81books.json');
const deuterocanonCodes = ['tob','jdt','wis','sir','bar','1ma','2ma','3ma','4ma','man','1es','2es','esg','lje','s3y','sus','bel'];
console.log('🔗 Adding Deuterocanon...');
const bible = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
console.log('📚 Protestant:', Object.keys(bible).length, 'books');
let added = 0;
deuterocanonCodes.forEach(code => {
  const deuterFile = path.join(bibleDir, code + '.json');
  if (fs.existsSync(deuterFile)) {
    const deuterContent = JSON.parse(fs.readFileSync(deuterFile, 'utf8'));
    const bookCode = Object.keys(deuterContent)[0];
    if (bookCode && !bible[bookCode]) {
      bible[bookCode] = deuterContent[bookCode];
      added++;
      console.log('  ✓ Added:', code);
    }
  }
});
fs.writeFileSync(outputFile, JSON.stringify(bible, null, 2));
console.log('\n✅ Saved:', outputFile);
console.log('📚 Total:', Object.keys(bible).length, 'books (' + added + ' Deuterocanon)');
