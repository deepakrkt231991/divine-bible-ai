const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');

const corpusFolder = path.join(__dirname, '..', 'bible-corpus', 'bibles');
const outputFolder = path.join(__dirname, '..', 'public', 'bible');

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

const langMap = {
  'Hindi': 'hin-hindi-osis.json',
  'English-WEB': 'eng-web-osis.json',
  'Spanish': 'spa-rvr1909.json',
  'French': 'fre-lsg.json',
  'German': 'ger-schl2000.json',
  'Portuguese': 'por-almeida.json',
  'Arabic': 'ara-arabic-osis.json',
  'Hebrew': 'heb-hebrew-osis.json',
  'Italian': 'ita-italian-osis.json',
  'Russian': 'rus-russian-osis.json',
  'Thai': 'tha-thai-osis.json',
};

// Parse CES Format using DOM Parser (Proper XML handling)
function parseCESFormat(xmlContent) {
  const result = {};
  
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Get all book divs
    const books = xmlDoc.getElementsByTagName('div');
    
    for (let i = 0; i < books.length; i++) {
      const div = books[i];
      const type = div.getAttribute('type');
      const id = div.getAttribute('id');
      
      // Find books: <div type="book" id="b.GEN">
      if (type === 'book' && id && id.startsWith('b.')) {
        const bookCode = id.replace('b.', '').toLowerCase(); // GEN, EXO, etc.
        result[bookCode] = {};
        
        // Get all child divs (chapters)
        const chapters = div.getElementsByTagName('div');
        
        for (let j = 0; j < chapters.length; j++) {
          const chapterDiv = chapters[j];
          const chapterType = chapterDiv.getAttribute('type');
          const chapterId = chapterDiv.getAttribute('id');
          
          // Find chapters: <div type="chapter" id="b.GEN.1">
          if (chapterType === 'chapter' && chapterId && chapterId.startsWith(`b.${id.replace('b.', '')}.`)) {
            const chapterNum = chapterId.split('.').pop(); // Get last part: 1, 2, 3...
            result[bookCode][chapterNum] = [];
            
            // Get all seg tags (verses)
            const verses = chapterDiv.getElementsByTagName('seg');
            
            for (let k = 0; k < verses.length; k++) {
              const verseSeg = verses[k];
              const verseType = verseSeg.getAttribute('type');
              const verseId = verseSeg.getAttribute('id');
              
              // Find verses: <seg type="verse" id="b.GEN.1.1">
              if (verseType === 'verse' && verseId) {
                const verseNum = verseId.split('.').pop(); // Get last part: 1, 2, 3...
                let verseText = verseSeg.textContent || '';
                
                // Clean text
                verseText = verseText.trim().replace(/\s+/g, ' ');
                
                if (verseText) {
                  result[bookCode][chapterNum].push({
                    verse: parseInt(verseNum),
                    text: verseText
                  });
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`  ❌ XML Parse Error:`, error.message);
  }
  
  return result;
}

// Convert all files
Object.entries(langMap).forEach(([xmlName, jsonName]) => {
  try {
    const xmlPath = path.join(corpusFolder, `${xmlName}.xml`);
    
    if (fs.existsSync(xmlPath)) {
      console.log(`\n📖 Converting: ${xmlName}.xml`);
      
      const xmlContent = fs.readFileSync(xmlPath, 'utf8');
      console.log(`  📄 XML Size: ${(xmlContent.length / 1024 / 1024).toFixed(2)} MB`);
      
      // Parse using DOM
      const jsonData = parseCESFormat(xmlContent);
      
      const booksCount = Object.keys(jsonData).length;
      const totalChapters = Object.values(jsonData).reduce((acc, book) => 
        acc + Object.keys(book).length, 0);
      const totalVerses = Object.values(jsonData).reduce((acc, book) => 
        acc + Object.values(book).reduce((cAcc, chapter) => cAcc + (Array.isArray(chapter) ? chapter.length : 0), 0), 0);
      
      if (booksCount > 0) {
        const jsonString = JSON.stringify(jsonData, null, 2);
        const outputPath = path.join(outputFolder, jsonName);
        fs.writeFileSync(outputPath, jsonString);
        
        const jsonSize = (Buffer.byteLength(jsonString) / 1024 / 1024).toFixed(2);
        
        console.log(`  ✅ Saved: ${jsonName}`);
        console.log(`  📊 JSON Size: ${jsonSize} MB`);
        console.log(`  📚 Books: ${booksCount}`);
        console.log(`  📖 Chapters: ${totalChapters}`);
        console.log(`  ✝️  Verses: ${totalVerses}`);
      } else {
        console.log(`  ⚠️  WARNING: No books parsed! Check XML structure.`);
      }
    } else {
      console.log(`⚠️  File not found: ${xmlName}.xml`);
    }
  } catch (error) {
    console.error(`❌ Error converting ${xmlName}:`, error.message);
  }
});

console.log('\n✨ Conversion Complete!');