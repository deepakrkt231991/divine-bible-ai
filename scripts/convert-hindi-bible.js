const fs = require('fs');
const path = require('path');

// Book number to code mapping (66 Protestant books)
const BOOK_MAP = {
  1:'gen',2:'exo',3:'lev',4:'num',5:'deu',6:'jos',7:'jdg',8:'rut',9:'1sa',10:'2sa',
  11:'1ki',12:'2ki',13:'1ch',14:'2ch',15:'ezr',16:'neh',17:'est',18:'job',19:'psa',20:'pro',
  21:'ecc',22:'sng',23:'isa',24:'jer',25:'lam',26:'ezk',27:'dan',28:'hos',29:'jol',30:'amo',
  31:'oba',32:'jon',33:'mic',34:'nah',35:'hab',36:'zep',37:'hag',38:'zec',39:'mal',
  40:'mat',41:'mrk',42:'luk',43:'jhn',44:'act',45:'rom',46:'1co',47:'2co',48:'gal',49:'eph',
  50:'php',51:'col',52:'1th',53:'2th',54:'1ti',55:'2ti',56:'tit',57:'phm',58:'heb',59:'jas',
  60:'1pe',61:'2pe',62:'1jn',63:'2jn',64:'3jn',65:'jud',66:'rev'
};

const xmlFile = path.join(__dirname, '../public/bible/hin-hindi-osis.xml');
const outputFile = path.join(__dirname, '../public/bible/hin-hindi-osis.json');

console.log('📖 Converting Hindi Bible (IRVHIN)...');
console.log('📁 File:', xmlFile);

// Check if file exists
if (!fs.existsSync(xmlFile)) {
  console.log('❌ File not found:', xmlFile);
  process.exit(1);
}

// Check file size
const stats = fs.statSync(xmlFile);
console.log('📦 Size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

const { DOMParser } = require('xmldom');
const xmlContent = fs.readFileSync(xmlFile, 'utf8');
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

const bible = {};
const books = xmlDoc.getElementsByTagName('book');

console.log('📚 Found', books.length, 'book elements');

for (let i = 0; i < books.length; i++) {
  const book = books[i];
  const bookNum = book.getAttribute('number');
  const bookCode = BOOK_MAP[bookNum];
  
  if (!bookCode) {
    console.log('⚠️  Skip book number:', bookNum);
    continue;
  }
  
  bible[bookCode] = {};
  const chapters = book.getElementsByTagName('chapter');
  
  for (let j = 0; j < chapters.length; j++) {
    const chapter = chapters[j];
    const chapterNum = chapter.getAttribute('number');
    bible[bookCode][chapterNum] = [];
    
    const verses = chapter.getElementsByTagName('verse');
    for (let k = 0; k < verses.length; k++) {
      const verse = verses[k];
      const verseNum = parseInt(verse.getAttribute('number'));
      const text = (verse.textContent || '').trim();
      
      if (text.length > 0) {
        bible[bookCode][chapterNum].push({ verse: verseNum, text });
      }
    }
  }
  console.log('  ✓', bookCode, '(' + Object.keys(bible[bookCode]).length, 'chapters)');
}

fs.writeFileSync(outputFile, JSON.stringify(bible, null, 2));
console.log('\n✅ Saved:', outputFile);
console.log('📚 Total Books:', Object.keys(bible).length);
console.log('📖 Sample:', Object.keys(bible).slice(0, 10).join(', '));
