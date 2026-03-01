// Ye script seedha saari languages ki Bible fetch karegi
export const fetchBible = async (lang) => {
    const codes = {
      'hindi': 'HINIRV',
      'english': 'KJV',
      'marathi': 'MARIRV'
    };
    
    const response = await fetch(`https://bolls.life/static/translations/${codes[lang]}.json`);
    if (!response.ok) throw new Error('Data not found');
    return await response.json();
  };