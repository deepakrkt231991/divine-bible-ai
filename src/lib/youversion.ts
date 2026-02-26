/**
 * Utility to fetch data from YouVersion API via the local proxy.
 */
async function fetchYouVersionAPI(endpoint: string) {
  // Ensure path starts with /
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  // Call local proxy
  const url = `/api/youversion?path=${encodeURIComponent(path)}`;
  
  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      let errBody: any = {};
      try { errBody = await res.json(); } 
      catch { errBody = { message: await res.text() }; }
      
      console.error('[YouVersion Lib Error]', { status: res.status, body: errBody, path });
      return null;
    }

    return res.json();
  } catch (err) {
    console.error('[YouVersion Fetch Error]', err);
    return null;
  }
}

/**
 * Get Bibles (Fixed 422 with language_ranges[] required by YouVersion)
 */
export async function getBibles() {
  const path = "/v1/bibles?language_ranges%5B%5D=*"; 
  try {
    const data = await fetchYouVersionAPI(path);
    if (!data) return [];
    // Handle different response shapes
    return Array.isArray(data) ? data : data?.data || data?.bibles || [];
  } catch (err) {
    console.error('getBibles error', err);
    return [];
  }
}

/**
 * Get Passage Content (Chapter or Verse)
 */
export async function getPassage(bibleId: string, usfm: string) {
  if (!bibleId || !usfm) return { content: "Missing selection", reference: "" };
  
  const endpoint = `/v1/bibles/${bibleId}/passages/${encodeURIComponent(usfm)}`;
  try {
    const data = await fetchYouVersionAPI(endpoint);
    if (!data) throw new Error("No data returned");
    return data;
  } catch (err) {
    console.error('getPassage error', err);
    return { 
      id: usfm, 
      content: "Scripture load nahi ho paya. Please USFM format (e.g., JHN.3.16) check karein.", 
      reference: "Error" 
    };
  }
}

/**
 * Helper for Home Page / Single Verse fetches
 */
export async function getSingleVerse(bibleId: string, verseUsfm: string) {
  return getPassage(bibleId, verseUsfm);
}

// Dummy empty functions to prevent build errors
export async function getBooks(bibleId: string) { return []; }
export async function getChapters(bibleId: string, bookId: string) { return []; }
