const fs = require('fs');
const path = require('path');

const bibleDir = path.join(__dirname, '../public/bible');

// Missing Deuterocanon books (jo tumhare paas nahi hain)
const missingBooks = {
  'tob': 'TOB',    // Tobit
  'sir': 'SIR',    // Sirach
  'bar': 'BAR',    // Baruch
  '3ma': '3MA',    // 3 Maccabees
  '4ma': '4MA',    // 4 Maccabees
  'esg': 'ESG',    // Additions to Esther
  'lje': 'LJE',    // Letter of Jeremiah
  's3y': 'S3Y'     // Song of Three Jews
};

async function downloadMissing() {
  console.log('📖 Downloading missing Deuterocanon books...\n');
  
  for (const [code, apiBook] of Object.entries(missingBooks)) {
    const outputFile = path.join(bibleDir, code + '.json');
    
    // Skip if already exists
    if (fs.existsSync(outputFile)) {
      console.log('⏭️  Already exists:', code);
      continue;
    }
    
    try {
      console.log('📥 Fetching', apiBook + '...');
      const res = await fetch('https://bible-api.com/' + apiBook + '?translation=KJV');
      const data = await res.json();
      
      if (data.chapters && data.chapters.length > 0) {
        // Convert to our format: { "tob": { "1": [{verse:1, text:"..."}] } }
        const converted = { [code]: {} };
        data.chapters.forEach(ch => {
          converted[code][ch.chapter] = ch.verses.map(v => ({
            verse: v.verse,
            text: v.text.trim()
          }));
        });
        
        fs.writeFileSync(outputFile, JSON.stringify(converted, null, 2));
        console.log('  ✅ Saved:', code + '.json (' + data.chapters.length + ' chapters)');
      } else {
        console.log('  ⚠️  Not available via API:', apiBook);
      }
      
      // Rate limit se bachne ke liye wait
      await new Promise(r => setTimeout(r, 600));
      
    } catch (error) {
      console.log('  ❌ Error:', code, '-', error.message);
    }
  }
  
  console.log('\n✨ Download complete!');
  
  // Final count
  const allDeuter = ['tob','jdt','wis','sir','bar','1ma','2ma','3ma','4ma','man','1es','2es','esg','lje','s3y','sus','bel'];
  const available = allDeuter.filter(code => fs.existsSync(path.join(bibleDir, code + '.json')));
  console.log('📚 Available Deuterocanon:', available.length + '/17');
  console.log('Files:', available.join(', '));
}

downloadMissing();
