const fs = require('fs');
const path = require('path');

const bibleDir = path.join(__dirname, '../public/bible');
const inputFile = path.join(bibleDir, 'hin-hindi-osis-80books.json');
const outputDir = path.join(bibleDir, 'split');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('✂️  Splitting Bible...\n');
const bible = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const books = Object.keys(bible);

books.forEach(bookCode => {
  const bookData = bible[bookCode];
  const chapters = Object.keys(bookData);
  
  // Save entire book
  fs.writeFileSync(
    path.join(outputDir, `${bookCode}.json`),
    JSON.stringify(bookData, null, 2)
  );
  
  // Save each chapter separately
  chapters.forEach(chapterNum => {
    const chapterData = bookData[chapterNum];
    fs.writeFileSync(
      path.join(outputDir, `${bookCode}-${chapterNum}.json`),
      JSON.stringify({ book: bookCode, chapter: parseInt(chapterNum), verses: chapterData }, null, 2)
    );
  });
});

// Create index
const index = {
  language: 'hin-hindi',
  totalBooks: books.length,
  books: books.map(code => ({ code, chapters: Object.keys(bible[code]).length }))
};
fs.writeFileSync(path.join(outputDir, 'index.json'), JSON.stringify(index, null, 2));

console.log(`✅ Split complete: ${books.length} books → ${outputDir}/`);
