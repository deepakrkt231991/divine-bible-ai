// scripts/parse-kjv-xml.js
// ✅ Updated: CLI arguments + correct codes + better parsing
// Usage: node parse-kjv-xml.js [input.xml] [output-prefix]
// Example: node parse-kjv-xml.js hin-irv.xml hin-irv

const fs = require('fs');
const path = require('path');

// ============ CONFIG FROM CLI ARGS ============
const INPUT_ARG = process.argv[2] || 'eng-kjv.osis.xml';
const PREFIX_ARG = process.argv[3] || 'eng-kjv';

const XML_FILE = path.isAbsolute(INPUT_ARG) 
  ? INPUT_ARG 
  : path.join(__dirname, '../public/open-bibles', INPUT_ARG);

const OUTPUT_DIR = path.join(__dirname, '../public/bible/split');
const COMBINED_FILE = path.join(__dirname, `../public/bible/${PREFIX_ARG}-81books.json`);

console.log(`🔍 Parsing ${INPUT_ARG} with prefix "${PREFIX_ARG}"...\n`);

// ============ VALIDATION ============
if (!fs.existsSync(XML_FILE)) {
  console.error(`❌ XML file not found: ${XML_FILE}`);
  console.log('💡 Available files:');
  try {
    const files = fs.readdirSync(path.dirname(XML_FILE)).filter(f => f.endsWith('.xml'));
    files.forEach(f => console.log(`   - ${f}`));
  } catch (e) {}
  process.exit(1);
}

// ============ LOAD XML ============
let xml = fs.readFileSync(XML_FILE, 'utf8');
console.log(`✅ XML loaded: ${(xml.length / 1024 / 1024).toFixed(2)} MB`);

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ============ PREPARE PARSING ============
const bible = {};
let booksFound = 0;

// Remove XML namespaces for easier regex matching
xml = xml.replace(/xmlns="[^"]*"/g, '')
         .replace(/xsi:[^=]+="[^"]*"/g, '')
         .replace(/xml:lang="[^"]*"/g, '');

// ============ PARSE BOOKS ============
// Pattern: <div type="book" osisID="Gen" ...> ... </div>
const bookRegex = /<div[^>]*type="book"[^>]*osisID="([^"]+)"[^>]*>([\s\S]*?)(?=<div[^>]*type="book"|<\/osisText>$)/gi;

let bookMatch;
while ((bookMatch = bookRegex.exec(xml)) !== null) {
  const bookId = bookMatch[1].toLowerCase();
  const bookContent = bookMatch[2];
  
  bible[bookId] = {};
  booksFound++;
  
  // ============ PARSE CHAPTERS ============
  // Pattern: <chapter osisRef="Gen.1" n="1" />
  const chapterRegex = /<chapter[^>]*osisRef="[^"]+\.(\d+)"[^>]*n="(\d+)"[^>]*\/>/gi;
  
  const chapters = [];
  let chMatch;
  while ((chMatch = chapterRegex.exec(bookContent)) !== null) {
    chapters.push({ num: chMatch[1], index: chMatch.index });
  }
  
  // ============ PARSE VERSES FOR EACH CHAPTER ============
  for (let i = 0; i < chapters.length; i++) {
    const chNum = chapters[i].num;
    const startIdx = chapters[i].index;
    const endIdx = chapters[i + 1]?.index ?? bookContent.length;
    
    const chapterText = bookContent.substring(startIdx, endIdx);
    
    // Pattern: <verse ... n="1" />Text<verse eID=... />
    // Handles verses split across <p> tags and with <transChange> elements
    const verseRegex = /<verse[^>]*n="(\d+)"[^>]*\/>([\s\S]*?)(?=<verse[^>]*(?:n|eID)=|<\/p>|<\/chapter>|$)/gi;
    
    const verses = [];
    let vMatch;
    while ((vMatch = verseRegex.exec(chapterText)) !== null) {
      const verseNum = parseInt(vMatch[1]);
      
      // Clean verse text: remove XML tags, decode entities, normalize whitespace
      let text = vMatch[2]
        .replace(/<[^>]+>/g, '')                    // Remove all XML tags
        .replace(/\s+/g, ' ')                        // Normalize whitespace
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .trim();
      
      // Only add if we have valid content
      if (text && verseNum > 0 && text.length > 0) {
        verses.push({ verse: verseNum, text });
      }
    }
    
    // Save chapter if it has verses
    if (verses.length > 0) {
      bible[bookId][chNum] = verses;
    }
  }
  
  // Progress output
  if (booksFound % 10 === 0) {
    console.log(`  Processed ${booksFound} books...`);
  }
}

console.log(`\n📊 Parsed: ${booksFound} books`);

if (booksFound === 0) {
  console.error('❌ No books parsed - check XML format');
  console.log('💡 First 200 chars of XML:');
  console.log(xml.substring(0, 200));
  process.exit(1);
}

// ============ SAVE COMBINED JSON ============
fs.writeFileSync(COMBINED_FILE, JSON.stringify(bible, null, 2));
console.log(`✅ Saved combined: ${COMBINED_FILE}`);
console.log(`💾 Size: ${(fs.statSync(COMBINED_FILE).size / 1024 / 1024).toFixed(2)} MB`);

// ============ SAVE SPLIT CHAPTER FILES ============
console.log('\n✂️  Creating split files...');
let fileCount = 0;

for (const [bookCode, chapters] of Object.entries(bible)) {
  for (const [chapterNum, verses] of Object.entries(chapters)) {
    if (!verses?.length) continue;
    
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
  if (chCount > 0) {
    console.log(`✅ ${bookCode}: ${chCount} chapters`);
  }
}

// ============ CREATE INDEX FILE ============
const index = {
  language: PREFIX_ARG,
  source: INPUT_ARG,
  totalBooks: Object.keys(bible).length,
  totalFiles: fileCount,
  generated: new Date().toISOString(),
  books: Object.entries(bible).map(([code, ch]) => ({
    code,
    chapters: Object.keys(ch).length
  }))
};
fs.writeFileSync(path.join(OUTPUT_DIR, `${PREFIX_ARG}-index.json`), JSON.stringify(index, null, 2));

// ============ FINAL SUMMARY ============
console.log(`\n🎉 Complete!`);
console.log(`📚 Books: ${Object.keys(bible).length}`);
console.log(`📄 Split files: ${fileCount}`);
console.log(`📁 Output: ${OUTPUT_DIR}`);

// ============ VERIFICATION (with CORRECT codes) ============
console.log('\n🔍 Verification (using actual parsed codes):');

// Map of common user inputs to actual file codes
const codeMap = {
  'gen': 'gen', 'exod': 'exod', 'lev': 'lev', 'num': 'num', 'deut': 'deut',
  'matt': 'matt', 'mark': 'mark', 'luke': 'luke', 'john': 'john',
  'ps': 'ps', 'prov': 'prov', 'eccl': 'eccl',
  'tob': 'tob', 'jdt': 'jdt', 'wis': 'wis', 'sir': 'sir'
};

const testCases = [
  { code: 'gen', ch: 1, expected: 31, label: 'Genesis 1' },
  { code: 'exod', ch: 20, expected: 26, label: 'Exodus 20 (10 Commandments)' },
  { code: 'ps', ch: 23, expected: 6, label: 'Psalms 23' },
  { code: 'matt', ch: 1, expected: 25, label: 'Matthew 1' },
  { code: 'john', ch: 3, expected: 36, label: 'John 3' },
  { code: 'tob', ch: 1, expected: 22, label: 'Tobit 1 (Deuterocanon)' },
  { code: 'sir', ch: 10, expected: null, label: 'Sirach 10 (Deuterocanon)' }
];

testCases.forEach(({ code, ch, expected, label }) => {
  const filename = `${code}-${ch}.json`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    const count = data.verses?.length || 0;
    const status = expected === null ? '✅' : (count === expected ? '✅' : '⚠️');
    const note = expected === null ? '' : (count === expected ? '' : ` (expected ${expected})`);
    console.log(`${status} ${label} (${filename}): ${count} verses${note}`);
  } else {
    console.log(`❌ ${label} (${filename}): NOT FOUND`);
  }
});

// ============ USAGE INSTRUCTIONS ============
console.log('\n📋 Usage in app:');
console.log(`   - Split file: /bible/split/${Object.keys(bible)[0]}-1.json`);
console.log(`   - Combined: /bible/${PREFIX_ARG}-81books.json`);
console.log(`   - API: ?book=${Object.keys(bible)[0]}&chapter=1&lang=${PREFIX_ARG}`);

console.log('\n✨ Ready for deployment!');