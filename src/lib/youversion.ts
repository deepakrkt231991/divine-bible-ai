// src/lib/youversion.ts
const BASE = "https://api.youversion.com";
const KEY = process.env.NEXT_PUBLIC_YOUVERSION_KEY;

async function fetchYouVersion(endpoint: string) {
  const url = `${BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  console.log("📡 YouVersion Request:", url);

  const res = await fetch(url, {
    headers: {
      "X-YVP-App-Key": KEY!,
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("❌ YouVersion Error:", res.status, err);
    throw new Error(err.message || `API ${res.status}`);
  }

  return res.json();
}

// ================== BEST UPDATED FUNCTIONS ==================

export async function getBibles() {
  // language_ranges[]=* → all languages + Hindi/English priority
  const data = await fetchYouVersion(`/v1/bibles?language_ranges[]=*&language_ranges[]=hi&language_ranges[]=en&page_size=50`);
  return Array.isArray(data) ? data : data?.data || [];
}

export async function getBooks(bibleId: string) {
  const data = await fetchYouVersion(`/v1/bibles/${bibleId}/books`);
  return Array.isArray(data) ? data : data?.data || [];
}

export async function getChapters(bibleId: string, bookId: string) {
  const data = await fetchYouVersion(`/v1/bibles/${bibleId}/books/${bookId}/chapters`);
  return Array.isArray(data) ? data : data?.data || [];
}

export async function getPassage(bibleId: string, passageId: string) {
  // Determine if passageId refers to a whole chapter (e.g., GEN.1) or a specific verse (e.g., GEN.1.1)
  // Verse IDs typically have 2 dots, Chapter IDs have 1 dot.
  const parts = passageId.split('.');
  const isVerse = parts.length > 2;
  const resourceType = isVerse ? 'passages' : 'chapters';

  const data = await fetchYouVersion(`/v1/bibles/${bibleId}/${resourceType}/${passageId}`);
  return data; // { id, reference, content, copyright, ... }
}

// Alias for home page and other single verse requirements
export const getSingleVerse = getPassage;
