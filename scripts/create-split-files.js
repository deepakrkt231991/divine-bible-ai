const fs = require('fs');
const path = require('path');

// Bible books with chapters
const BOOKS = {
  // Old Testament (39)
  'gen': 50, 'exo': 40, 'lev': 27, 'num': 36, 'deu': 34,
  'jos': 24, 'jdg': 21, 'rut': 4, '1sa': 31, '2sa': 24,
  '1ki': 22, '2ki': 25, '1ch': 29, '2ch': 36, 'ezr': 10,
  'neh': 13, 'est': 10, 'job': 42, 'psa': 150, 'pro': 31,
  'ecc': 12, 'sng': 8, 'isa': 66, 'jer': 52, 'lam': 5,
  'ezk': 48, 'dan': 12, 'hos': 14, 'jol': 3, 'amo': 9,
  'oba': 1, 'jon': 4, 'mic': 7, 'nah': 3, 'hab': 3,
  'zep': 3, 'hag': 2, 'zec': 14, 'mal': 4,
  
  // New Testament (27)
  'mat': 28, 'mrk': 16, 'luk': 24, 'jhn': 21, 'act': 28,
  'rom': 16, '1co': 16, '2co': 13, 'gal': 6, 'eph': 6,
  'php': 4, 'col': 4, '1th': 5, '2th': 3, '1ti': 6,
  '2ti': 4, 'tit': 3, 'phm': 1, 'heb': 13, 'jas': 5,
  '1pe': 5, '2pe': 3, '1jn': 5, '2jn': 1, '3jn': 1,
  'jud': 1, 'rev': 22,
  
  // Apocrypha (15)
  'tob': 14, 'jdt': 16, 'wis': 19, 'sir': 51, 'bar': 6,
  '1ma': 16, '2ma': 15, '1es': 9, '2es': 16, 'man': 1,
  'psa151': 1, '3ma': 7, '4ma': 18, 'sus': 1, 'bel': 1
};

const splitDir = path.join(__dirname, '../public/bible/split');

console.log('�� Creating split files for 81 books...');

Object.entries(BOOKS).forEach(([code, chapters]) => {
  const bookDir = path.join(splitDir, code);
  if (!fs.existsSync(bookDir)) {
    fs.mkdirSync(bookDir, { recursive: true });
  }
  
  for (let ch = 1; ch <= chapters; ch++) {
    const verses = [];
    for (let v = 1; v <= 5; v++) {
      verses.push({
        verse: v,
        text: `Sample verse ${v} for chapter ${ch}`
      });
    }
    fs.writeFileSync(
      path.join(bookDir, `${ch}.json`),
      JSON.stringify(verses, null, 2)
    );
  }
  console.log(`✅ ${code} - ${chapters} chapters`);
});

console.log('\n🎉 Total books:', Object.keys(BOOKS).length);
