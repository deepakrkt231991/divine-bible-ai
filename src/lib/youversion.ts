/**
 * Utility to fetch data from YouVersion API via the local proxy.
 */
async function fetchYouVersionAPI(endpoint: string) {
  // Ensure path starts with /
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  // Call local proxy
  const url = `/api/youversion?path=${encodeURIComponent(path)}`;
  
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    let errBody: any = {};
    try { errBody = await res.json(); } 
    catch { errBody = { message: await res.text() }; }
    
    console.error('[YouVersion Lib Error]', { status: res.status, body: errBody });
    throw new Error(`API failed: ${res.status} - ${JSON.stringify(errBody)}`);
  }

  return res.json();
}

/**
 * Get Bibles (Fixed 422 with language_ranges[])
 */
export async function getBibles() {
  // language_ranges[] is REQUIRED for listing bibles
  const path = "/v1/bibles?language_ranges%5B%5D=*"; 
  try {
    const data = await fetchYouVersionAPI(path);
    return Array.isArray(data) ? data : data?.data || data?.bibles || [];
  } catch (err) {
    console.error('getBibles error', err);
    return [];
  }
}

/**
 * Get Books for a Bible ID
 */
export async function getBooks(bibleId: string) {
  try {
    const data = await fetchYouVersionAPI(`/v1/bibles/${bibleId}/books`);
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (e) {
    console.error("getBooks failed:", e);
    return [];
  }
}

/**
 * Get Chapters for a Book
 */
export async function getChapters(bibleId: string, bookId: string) {
  try {
    const data = await fetchYouVersionAPI(`/v1/bibles/${bibleId}/books/${bookId}/chapters`);
    return Array.isArray(data) ? data : (data?.data || []);
  } catch (e) {
    console.error("getChapters failed:", e);
    return [];
  }
}

/**
 * Get Passage Content
 */
export async function getPassage(bibleId: string, usfm: string) {
  if (!bibleId || !usfm) throw new Error("Missing bibleId or usfm");
  
  const endpoint = `/v1/bibles/${bibleId}/passages/${encodeURIComponent(usfm)}`;
  try {
    const data = await fetchYouVersionAPI(endpoint);
    return data;
  } catch (err) {
    console.error('getPassage error', err);
    return { 
      id: usfm, 
      content: "Unable to load verse. Please try again.", 
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
