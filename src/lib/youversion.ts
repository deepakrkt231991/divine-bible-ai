export async function fetchYouVersion(path: string) {
  // Use local proxy to avoid CORS and handle headers
  const url = `/api/youversion?path=${encodeURIComponent(path)}`;
  
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("❌ YouVersion Proxy Error:", res.status, errorData);
    throw new Error(errorData.error || `API ${res.status}`);
  }

  return res.json();
}

export async function getBibles() {
  const query = new URLSearchParams();
  query.append('language_ranges[]', '*'); // This is often required for listing bibles
  
  const data = await fetchYouVersion(`/v1/bibles?${query.toString()}`);
  return Array.isArray(data) ? data : data?.data || data?.bibles || [];
}

export async function getBooks(bibleId: string) {
  const data = await fetchYouVersion(`/v1/bibles/${bibleId}/books`);
  return Array.isArray(data) ? data : data?.data || [];
}

export async function getChapters(bibleId: string, bookId: string) {
  try {
      const data = await fetchYouVersion(`/v1/bibles/${bibleId}/books/${bookId}/chapters`);
      return Array.isArray(data) ? data : data?.data || [];
  } catch (err) {
      console.warn("Standard chapters path failed, trying fallback...");
      const fallback = await fetchYouVersion(`/v1/bibles/${bibleId}/chapters?book_id=${bookId}`);
      return Array.isArray(fallback) ? fallback : fallback?.data || [];
  }
}

export async function getPassage(bibleId: string, passageId: string) {
  if (!bibleId || !passageId) return null;
  const data = await fetchYouVersion(`/v1/bibles/${bibleId}/passages/${passageId}`);
  return data;
}

export const getSingleVerse = getPassage;

// Helper to ensure book IDs are uppercase
export function normalizeUSFM(id: string) {
  return id.toUpperCase();
}
