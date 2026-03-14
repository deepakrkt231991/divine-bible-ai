const fs = require('fs');
const path = require('path');

const splitDir = path.join(__dirname, 'split');
const indexFile = path.join(__dirname, 'gemini-index.json');

const index = {};

// Saari split files ka index banao
const books = fs.readdirSync(splitDir);

books.forEach(book => {
  const bookPath = path.join(splitDir, book);
  if (!fs.statSync(bookPath).isDirectory()) return;
  
  index[book] = {};
  const chapters = fs.readdirSync(bookPath);
  
  chapters.forEach(chapterFile => {
    const chapter = chapterFile.replace('.json', '');
    const filePath = path.join(bookPath, chapterFile);
    const stats = fs.statSync(filePath);
    
    index[book][chapter] = {
      size: stats.size,
      path: `split/${book}/${chapterFile}`
    };
  });
});

fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));
console.log('✅ Gemini Index Created: gemini-index.json');
console.log(`📚 Total Books: ${Object.keys(index).length}`);
