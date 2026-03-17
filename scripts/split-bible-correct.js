const fs = require('fs');
const path = require('path');

const bibleDir = path.join(__dirname, '../public/bible');
const inputFile = path.join(bibleDir, 'hin-hindi-osis-80books.json');
const outputDir = path.join(bibleDir, 'split');

console.log('🔍 Checking input file...');
if (!fs.existsSync(inputFile)) {
  console.error('❌ Combined Bible file not found:', inputFile);
  console.log('💡 Try: node scripts/combine-81books.js first');
  process.exit(1);
}

console.log('📚 Loading combined Bible...');
const bible = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const books = Object.keys(bible);

console.log(`✂️  Splitting ${books.length} books...\n`);

let totalChapters = 0;
let totalFiles = 0;

books.forEach(bookCode => {
  const bookData = bible[bookCode];
  const chapters = Object.keys(bookData);
  
  chapters.forEach(chapterNum => {
    const chapterData = bookData[chapterNum];
    const verses = Array.isArray(chapterData) ? chapterData : Object.values(chapterData).flat();
    
    // Create JSON file: gen-1.json, gen-2.json, etc.
    const filename = `${bookCode}-${chapterNum}.json`;
    const filepath = path.join(outputDir, filename);
    
    const content = {
      book: bookCode,
      chapter: parseInt(chapterNum),
      verses: verses
    };
    
    fs.writeFileSync(filepath, JSON.stringify(content, null, 2));
    totalFiles++;
  });
  
  totalChapters += chapters.length;
  console.log(`✅ ${bookCode}: ${chapters.length} chapters`);
});

// Create index file
const index = {
  language: 'hin-hindi',
  totalBooks: books.length,
  totalChapters: totalChapters,
  totalFiles: totalFiles,
  books: books.map(code => ({
    code,
    chapters: Object.keys(bible[code]).length
  }))
};

fs.writeFileSync(path.join(outputDir, 'index.json'), JSON.stringify(index, null, 2));

console.log(`\n🎉 Split complete!`);
console.log(`📚 Books: ${books.length}`);
console.log(`📖 Chapters: ${totalChapters}`);
console.log(`📄 Files: ${totalFiles} JSON files in ${outputDir}`);
console.log(`📋 Index: split/index.json`);
