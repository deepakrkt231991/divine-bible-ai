const fs = require('fs');
const path = require('path');

const bibleDir = path.join(__dirname, '../public/bible');
const splitDir = path.join(bibleDir, 'split');
const combinedFile = path.join(bibleDir, 'hin-hindi-osis-80books.json');

console.log('🧪 Testing Bible Loader...\n');

// Test 1: Combined file load
console.log('📦 Test 1: Combined 80-books file');
try {
  const combined = JSON.parse(fs.readFileSync(combinedFile, 'utf8'));
  const books = Object.keys(combined);
  console.log(`   ✅ Loaded: ${books.length} books`);
  console.log(`   📚 Sample: ${books.slice(0, 10).join(', ')}...`);
  
  // Check Tobit specifically
  if (combined.tob) {
    const chapters = Object.keys(combined.tob);
    console.log(`   ✅ Tobit: ${chapters.length} chapters`);
    if (combined.tob['1']?.[0]?.text) {
      console.log(`   📖 Tobit 1:1: "${combined.tob['1'][0].text.substring(0, 50)}..."`);
    }
  } else {
    console.log(`   ❌ Tobit not found in combined file`);
  }
} catch (e) {
  console.log(`   ❌ Error: ${e.message}`);
}

// Test 2: Split files
console.log('\n✂️  Test 2: Split files');
if (fs.existsSync(splitDir)) {
  const files = fs.readdirSync(splitDir);
  const bookFiles = files.filter(f => f.endsWith('.json') && !f.includes('-') && f !== 'index.json');
  const chapterFiles = files.filter(f => f.includes('-') && f.endsWith('.json'));
  
  console.log(`   ✅ Total split files: ${files.length}`);
  console.log(`   📚 Book files: ${bookFiles.length}`);
  console.log(`   📖 Chapter files: ${chapterFiles.length}`);
  
  // Test Tobit split files
  if (files.includes('tob.json')) {
    const tob = JSON.parse(fs.readFileSync(path.join(splitDir, 'tob.json'), 'utf8'));
    console.log(`   ✅ tob.json: ${Object.keys(tob).length} chapters`);
  }
  if (files.includes('tob-1.json')) {
    const tob1 = JSON.parse(fs.readFileSync(path.join(splitDir, 'tob-1.json'), 'utf8'));
    console.log(`   ✅ tob-1.json: ${tob1.verses?.length || 0} verses`);
    if (tob1.verses?.[0]?.text) {
      console.log(`   📖 Tobit 1:1: "${tob1.verses[0].text.substring(0, 50)}..."`);
    }
  }
} else {
  console.log(`   ⚠️  Split directory not found - run split-bible.js first`);
}

// Test 3: Index file
console.log('\n📋 Test 3: Index file');
const indexFile = path.join(splitDir, 'index.json');
if (fs.existsSync(indexFile)) {
  const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  console.log(`   ✅ Index loaded: ${index.totalBooks} books`);
  console.log(`   📚 First 10: ${index.books.slice(0, 10).map(b => b.code).join(', ')}...`);
} else {
  console.log(`   ⚠️  Index file not found`);
}

// Test 4: File size check (for Gemini agent optimization)
console.log('\n⚡ Test 4: File sizes (for Gemini agent)');
const checkSize = (file) => {
  if (fs.existsSync(file)) {
    const size = fs.statSync(file).size;
    return size > 1024*1024 ? `${(size/1024/1024).toFixed(2)} MB` : `${(size/1024).toFixed(1)} KB`;
  }
  return 'N/A';
};

console.log(`   📦 Combined file: ${checkSize(combinedFile)}`);
console.log(`   📚 Single book (avg): ${checkSize(path.join(splitDir, 'gen.json'))}`);
console.log(`   📖 Single chapter (avg): ${checkSize(path.join(splitDir, 'gen-1.json'))}`);
console.log(`   💡 Gemini should load: chapter files (~5-20 KB each) NOT combined file`);

console.log('\n✨ Test complete!');
