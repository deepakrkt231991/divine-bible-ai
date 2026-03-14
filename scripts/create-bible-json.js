const fs = require('fs');
const path = require('path');

// 81 Books ka simple structure
const BOOKS = {
  // Old Testament
  'gen': { name: 'Genesis', chapters: 50 },
  'exo': { name: 'Exodus', chapters: 40 },
  'lev': { name: 'Leviticus', chapters: 27 },
  'num': { name: 'Numbers', chapters: 36 },
  'deu': { name: 'Deuteronomy', chapters: 34 },
  'jos': { name: 'Joshua', chapters: 24 },
  'jdg': { name: 'Judges', chapters: 21 },
  'rut': { name: 'Ruth', chapters: 4 },
  '1sa': { name: '1 Samuel', chapters: 31 },
  '2sa': { name: '2 Samuel', chapters: 24 },
  '1ki': { name: '1 Kings', chapters: 22 },
  '2ki': { name: '2 Kings', chapters: 25 },
  '1ch': { name: '1 Chronicles', chapters: 29 },
  '2ch': { name: '2 Chronicles', chapters: 36 },
  'ezr': { name: 'Ezra', chapters: 10 },
  'neh': { name: 'Nehemiah', chapters: 13 },
  'est': { name: 'Esther', chapters: 10 },
  'job': { name: 'Job', chapters: 42 },
  'psa': { name: 'Psalms', chapters: 150 },
  'pro': { name: 'Proverbs', chapters: 31 },
  'ecc': { name: 'Ecclesiastes', chapters: 12 },
  'sng': { name: 'Song of Solomon', chapters: 8 },
  'isa': { name: 'Isaiah', chapters: 66 },
  'jer': { name: 'Jeremiah', chapters: 52 },
  'lam': { name: 'Lamentations', chapters: 5 },
  'ezk': { name: 'Ezekiel', chapters: 48 },
  'dan': { name: 'Daniel', chapters: 12 },
  'hos': { name: 'Hosea', chapters: 14 },
  'jol': { name: 'Joel', chapters: 3 },
  'amo': { name: 'Amos', chapters: 9 },
  'oba': { name: 'Obadiah', chapters: 1 },
  'jon': { name: 'Jonah', chapters: 4 },
  'mic': { name: 'Micah', chapters: 7 },
  'nah': { name: 'Nahum', chapters: 3 },
  'hab': { name: 'Habakkuk', chapters: 3 },
  'zep': { name: 'Zephaniah', chapters: 3 },
  'hag': { name: 'Haggai', chapters: 2 },
  'zec': { name: 'Zechariah', chapters: 14 },
  'mal': { name: 'Malachi', chapters: 4 },
  
  // New Testament
  'mat': { name: 'Matthew', chapters: 28 },
  'mrk': { name: 'Mark', chapters: 16 },
  'luk': { name: 'Luke', chapters: 24 },
  'jhn': { name: 'John', chapters: 21 },
  'act': { name: 'Acts', chapters: 28 },
  'rom': { name: 'Romans', chapters: 16 },
  '1co': { name: '1 Corinthians', chapters: 16 },
  '2co': { name: '2 Corinthians', chapters: 13 },
  'gal': { name: 'Galatians', chapters: 6 },
  'eph': { name: 'Ephesians', chapters: 6 },
  'php': { name: 'Philippians', chapters: 4 },
  'col': { name: 'Colossians', chapters: 4 },
  '1th': { name: '1 Thessalonians', chapters: 5 },
  '2th': { name: '2 Thessalonians', chapters: 3 },
  '1ti': { name: '1 Timothy', chapters: 6 },
  '2ti': { name: '2 Timothy', chapters: 4 },
  'tit': { name: 'Titus', chapters: 3 },
  'phm': { name: 'Philemon', chapters: 1 },
  'heb': { name: 'Hebrews', chapters: 13 },
  'jas': { name: 'James', chapters: 5 },
  '1pe': { name: '1 Peter', chapters: 5 },
  '2pe': { name: '2 Peter', chapters: 3 },
  '1jn': { name: '1 John', chapters: 5 },
  '2jn': { name: '2 John', chapters: 1 },
  '3jn': { name: '3 John', chapters: 1 },
  'jud': { name: 'Jude', chapters: 1 },
  'rev': { name: 'Revelation', chapters: 22 },
  
  // Apocrypha (15 books)
  'tob': { name: 'Tobit', chapters: 14 },
  'jdt': { name: 'Judith', chapters: 16 },
  'wis': { name: 'Wisdom', chapters: 19 },
  'sir': { name: 'Sirach', chapters: 51 },
  'bar': { name: 'Baruch', chapters: 6 },
  '1ma': { name: '1 Maccabees', chapters: 16 },
  '2ma': { name: '2 Maccabees', chapters: 15 },
  '1es': { name: '1 Esdras', chapters: 9 },
  '2es': { name: '2 Esdras', chapters: 16 },
  'man': { name: 'Prayer of Manasseh', chapters: 1 },
  'psa151': { name: 'Psalm 151', chapters: 1 },
  '3ma': { name: '3 Maccabees', chapters: 7 },
  '4ma': { name: '4 Maccabees', chapters: 18 },
  'sus': { name: 'Susanna', chapters: 1 },
  'bel': { name: 'Bel and the Dragon', chapters: 1 }
};

console.log('📚 Creating 81 books structure...');

Object.entries(BOOKS).forEach(([code, info]) => {
  const bookDir = path.join(__dirname, '../public/bible/split', code);
  if (!fs.existsSync(bookDir)) {
    fs.mkdirSync(bookDir, { recursive: true });
  }
  
  for (let ch = 1; ch <= info.chapters; ch++) {
    const verses = [];
    for (let v = 1; v <= 5; v++) {
      verses.push({ verse: v, text: `Sample verse ${v} for ${info.name} chapter ${ch}` });
    }
    fs.writeFileSync(
      path.join(bookDir, `${ch}.json`),
      JSON.stringify(verses, null, 2)
    );
  }
  console.log(`✅ ${info.name} (${code}) - ${info.chapters} chapters`);
});

console.log('\n🎉 Done! Total books:', Object.keys(BOOKS).length);
