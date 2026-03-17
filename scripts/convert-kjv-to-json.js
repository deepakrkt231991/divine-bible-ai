const fs = require('fs');
const path = require('path');

// Config
const XML_FILE = path.join(__dirname, '../public/open-bibles/eng-kjv.osis.xml');
const OUTPUT_DIR = path.join(__dirname, '../public/bible/split');
const COMBINED_FILE = path.join(__dirname, '../public/bible/eng-kjv-81books.json');

console.log('📖 Converting eng-kjv.osis.xml to JSON...\n');

if (!fs.existsSync(XML_FILE)) {
  console.error('❌ XML file not found:', XML_FILE);
  process.exit(1);
}

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read and parse XML
const xml = fs.readFileSync(XML_FILE, 'utf8');
console.log('✅ XML loaded:', (xml.length / 1024 / 1024).toFixed(2), 'MB');

const bible = {};
let bookCount = 0;

// Parse OSIS format: <div type="book">...</div>
const bookRegex = /<div[^>]*type="book"[^>]*>[\s\S]*?<reference[^>]*osisID="[^"]+\.([^"]+)"[^>]*>[\s\S]*?<\/div>/gi;
const chapterRegex = /<chapter[^>]*osisID="[^"]+\.(\d+)"[^>]*>([\s\S]*?)<\/chapter>/gi;
const verseRegex = /<verse[^>]*osisID="[^"]+\.(\d+):(\d+)"[^>]*>([\s\S]*?)<\/verse>/gi;

let bookMatch;
while ((bookMatch = bookRegex.exec(xml)) !== null) {
  const bookId = bookMatch[1].toLowerCase();
  const bookContent = bookMatch[0];
  
  bible[bookId] = {};
  
  // Extract chapters
  let chapterMatch;
  while ((chapterMatch = chapterRegex.exec(bookContent)) !== null) {
    const chapterNum = chapterMatch[1];
    const chapterContent = chapterMatch[2];
    
    bible[bookId][chapterNum] = [];
    
    // Extract verses
    let verseMatch;
    while ((verseMatch = verseRegex.exec(chapterContent)) !== null) {
      const verseNum = parseInt(verseMatch[2]);
      const text = verseMatch[3]
        .replace(/<[^>]+>/g, '')  // Remove XML tags
        .replace(/\s+/g, ' ')      // Normalize whitespace
        .trim();
      
      if (text) {
        bible[bookId][chapterNum].push({ verse: verseNum, text });
      }
    }
  }
  
  bookCount++;
  if (bookCount % 10 === 0) console.log(`  Processed ${bookCount} books...`);
}

// Save COMBINED JSON file (for fallback)
fs.writeFileSync(COMBINED_FILE, JSON.stringify(bible, null, 2));
console.log(`✅ Saved combined: ${COMBINED_FILE}`);

// Save SPLIT chapter files (for fast loading)
console.log('\n✂️  Creating split chapter files...');
let fileCount = 0;

for (const [bookCode, chapters] of Object.entries(bible)) {
  for (const [chapterNum, verses] of Object.entries(chapters)) {
    if (!verses?.length) continue;
    
    // Create FILE: gen-1.json (NOT folder!)
    const filename = `${bookCode}-${chapterNum}.json`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    fs.writeFileSync(filepath, JSON.stringify({
      book: bookCode,
      chapter: parseInt(chapterNum),
      verses: verses
    }, null, 2));
    
    fileCount++;
  }
  const chCount = Object.keys(chapters).length;
  if (chCount > 0) console.log(`✅ ${bookCode}: ${chCount} chapters`);
}

// Create index
const index = {
  language: 'eng-kjv',
  totalBooks: Object.keys(bible).length,
  totalFiles: fileCount,
  books: Object.entries(bible).map(([code, ch]) => ({
    code, chapters: Object.keys(ch).length
  }))
};
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify(index, null, 2));

console.log(`\n🎉 Conversion complete!`);
console.log(`📚 Books: ${Object.keys(bible).length}`);
console.log(`📄 Split files: ${fileCount} JSON files`);
console.log(`💾 Combined: ${(fs.statSync(COMBINED_FILE).size/1024/1024).toFixed(2)} MB`);

// Verify
console.log('\n🔍 Verification:');
['gen-1.json', 'mat-1.json', 'psa-23.json'].forEach(f => {
  const fp = path.join(OUTPUT_DIR, f);
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
    const d = JSON.parse(fs.readFileSync(fp));
    console.log(`✅ ${f}: ${d.verses?.length || 0} verses`);
  } else {
    console.log(`❌ ${f}: NOT FOUND`);
  }
});
