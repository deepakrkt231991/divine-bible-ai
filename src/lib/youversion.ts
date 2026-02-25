// src/lib/youversion.ts

/**
 * Utility to fetch data from YouVersion API via the local proxy to avoid CORS issues.
 */
async function fetchYouVersion(endpoint: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);
  searchParams.set('path', endpoint);
  
  const res = await fetch(`/api/youversion?${searchParams.toString()}`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error("❌ YouVersion Proxy Error:", res.status, errorData);
    throw new Error(errorData.error || `API ${res.status}`);
  }

  return res.json();
}

/**
 * Fetches a list of available Bibles. Requires language_ranges[] param.
 */
export async function getBibles() {
  try {
    const data = await fetchYouVersion('/v1/bibles', { 'language_ranges[]': '*' });
    // Handle response – usually array ya { data: [...] }
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (e) {
    console.error("getBibles failed:", e);
    return [];
  }
}

/**
 * Fetches books for a specific Bible version.
 */
export async function getBooks(bibleId: string) {
  try {
    const data = await fetchYouVersion(`/v1/bibles/${bibleId}/books`);
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (e) {
    console.error("getBooks failed:", e);
    return [];
  }
}

/**
 * Fetches chapters for a specific book in a Bible version.
 */
export async function getChapters(bibleId: string, bookId: string) {
  try {
    const data = await fetchYouVersion(`/v1/bibles/${bibleId}/books/${bookId}/chapters`);
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (e) {
    console.error("getChapters failed:", e);
    return [];
  }
}

/**
 * Fetches the content of a specific Bible passage (verse or chapter).
 */
export async function getPassage(bibleId: string, passageId: string) {
  try {
    // Normalize passageId (book uppercase + no spaces)
    const normalized = passageId.toUpperCase().replace(/\s/g, '');
    console.log("Fetching passage:", bibleId, normalized);

    const data = await fetchYouVersion(`/v1/bibles/${bibleId}/passages/${normalized}`);
    return data;
  } catch (e) {
    console.error("getPassage failed:", e);
    return {
      reference: passageId || "Error",
      content: "<p>Passage nahi mila. Reference check kijiye.</p>",
      copyright: ""
    };
  }
}

/**
 * Alias for getPassage used in the home page for the Verse of the Day.
 */
export async function getSingleVerse(bibleId: string, passageId: string) {
  return getPassage(bibleId, passageId);
}
