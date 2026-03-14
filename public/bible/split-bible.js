const fs = require('fs');
const path = require('path');

const files = [
  'hin-hindi-osis.json',
  'hin-hindi-osis-80books.json',
  'hin-hindi-osis-81books.json',
  'mar-irv.xml',
  'nep-nepali-osis.xml',
  'tha-thai-osis.json'
];

const splitDir = path.join(__dirname, 'split');
if (!fs.existsSync(splitDir)) fs.mkdirSync(splitDir);

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  console.log(`Splitting ${file}...`);
  
  try {
    const content = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(content);
    
    // Har book ke liye alag folder
    Object.keys(data).forEach(book => {
      const bookClean = book.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const bookDir = path.join(splitDir, bookClean);
      if (!fs.existsSync(bookDir)) fs.mkdirSync(bookDir);
      
      // Har chapter ke liye alag file
      if (data[book] && typeof data[book] === 'object') {
        Object.keys(data[book]).forEach(chapter => {
          const chapterFile = path.join(bookDir, `${chapter}.json`);
          fs.writeFileSync(chapterFile, JSON.stringify(data[book][chapter], null, 2));
        });
      }
    });
    console.log(`✅ ${file} split complete`);
  } catch (e) {
    console.log(`❌ Error in ${file}:`, e.message);
  }
});

console.log('\n✨ Split complete! Files in split/ folder');
