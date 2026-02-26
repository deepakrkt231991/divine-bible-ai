/**
 * Utility to fetch data from YouVersion API via the local proxy to avoid CORS issues.
 */
async function fetchYouVersion(endpoint: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams();
  query.append("path", endpoint);
  Object.entries(params).forEach(([key, value]) => {
    query.append(key, value);
  });

  const res = await fetch(`/api/youversion?${query.toString()}`);

  if (!res.ok) {
    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {
      errorData = { error: `API ${res.status}` };
    }
    console.error("❌ YouVersion API Error:", res.status, errorData);
    throw new Error(errorData.error || `API ${res.status}`);
  }

  return res.json();
}

/**
 * Fetches a list of available Bibles. Required param: language_ranges[]
 */
export async function getBibles() {
  // language_ranges[] is required - use * for all or specify e.g. hi,en
  try {
    const data = await fetchYouVersion('/v1/bibles', { "language_ranges[]": "*" });
    return Array.isArray(data) ? data : (data?.data || data?.bibles || []);
  } catch (err) {
    console.error("getBibles failed:", err);
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
  if (!bibleId || !passageId) return { reference: "Error", content: "Invalid reference." };

  try {
    const normalized = passageId.toUpperCase().replace(/\s/g, '');
    const data = await fetchYouVersion(`/v1/bibles/${bibleId}/passages/${normalized}`);
    return data;
  } catch (e) {
    console.error("getPassage failed:", e);
    return {
      reference: passageId || "Error",
      content: "<p>Passage load nahi ho saka. Kripya reference check karein.</p>",
      copyright: ""
    };
  }
}

/**
 * Export getSingleVerse to prevent home page build from breaking.
 */
export async function getSingleVerse(bibleId: string, passageId: string) {
  return getPassage(bibleId, passageId);
}
