// src/lib/youversion.ts

/**
 * Helper to normalize USFM reference (e.g., 'gen.1' → 'GEN.1')
 */
function normalizeUSFM(ref: string): string {
  if (!ref) return '';
  const parts = ref.split('.');
  if (parts.length >= 1) {
    parts[0] = parts[0].toUpperCase();
  }
  return parts.join('.');
}

/**
 * Routes all YouVersion API requests through our local proxy to avoid CORS issues.
 */
async function fetchYouVersion(endpoint: string) {
  // We use the internal API proxy to avoid CORS and keep the key secure
  const url = `/api/youversion?path=${encodeURIComponent(endpoint)}`;
  
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("❌ YouVersion Proxy Error:", res.status, errorData);
    throw new Error(errorData.error || `API ${res.status}`);
  }

  return await res.json();
}

export async function getBibles() {
  // Required: language_ranges[] param for the API to return a list
  const endpoint = `/v1/bibles?language_ranges[]=*&page_size=100`;
  const data = await fetchYouVersion(endpoint);
  // The API usually returns an array directly or inside a 'data' key
  return Array.isArray(data) ? data : data?.data || data?.bibles || [];
}

export async function getBooks(bibleId: string) {
  if (!bibleId) return [];
  const endpoint = `/v1/bibles/${bibleId}/books`;
  const data = await fetchYouVersion(endpoint);
  return Array.isArray(data) ? data : data?.data || [];
}

export async function getChapters(bibleId: string, bookId: string) {
  if (!bibleId || !bookId) return [];
  const endpoint = `/v1/bibles/${bibleId}/books/${bookId}/chapters`;
  const data = await fetchYouVersion(endpoint);
  return Array.isArray(data) ? data : data?.data || [];
}

export async function getPassage(bibleId: string, passageId: string) {
  if (!bibleId || !passageId) return null;

  const normalizedId = normalizeUSFM(passageId);
  try {
    const data = await fetchYouVersion(`/v1/bibles/${bibleId}/passages/${normalizedId}`);
    return data;
  } catch (err) {
    console.warn(`Failed to fetch passage ${normalizedId}:`, err);
    return {
      id: normalizedId,
      reference: normalizedId,
      content: "<p>Vachan load nahi ho paaya. Please try a different Bible version or chapter.</p>",
      copyright: "Error loading content"
    };
  }
}

// Alias for consistency with older imports
export const getSingleVerse = getPassage;
