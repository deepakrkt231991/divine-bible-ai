import { loadChapter } from './bible-loader';

// Cache for loaded chapters (memory mein rakhega)
const chapterCache = new Map();

export async function loadForGemini(book: string, chapter: number): Promise<string> {
  const cacheKey = `${book}_${chapter}`;
  
  // Pehle cache check karo
  if (chapterCache.has(cacheKey)) {
    return chapterCache.get(cacheKey);
  }
  
  try {
    // Sirf 1 chapter load (50KB max)
    const verses = await loadChapter(book, chapter);
    
    if (!verses || verses.length === 0) {
      return `Error: ${book} ${chapter} not found`;
    }
    
    // Plain text mein convert karo (Gemini ke liye)
    const text = verses.map(v => `${v.verse}. ${v.text}`).join('\n');
    
    // Cache mein save karo (1 hour ke liye)
    chapterCache.set(cacheKey, text);
    setTimeout(() => chapterCache.delete(cacheKey), 3600000);
    
    return text;
  } catch (error) {
    console.error('Gemini loader error:', error);
    return `Error loading ${book} ${chapter}`;
  }
}

// Memory clear karne ka function
export const clearGeminiCache = () => chapterCache.clear();
