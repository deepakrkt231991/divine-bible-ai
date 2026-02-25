import type { Bible, Book, Chapter, Passage } from "@/types";

async function fetchYouVersionAPI(path: string): Promise<any> {
  const url = `/api/youversion?path=${encodeURIComponent(path)}`;
  console.log('[YouVersion API Request]', { url, keyPrefix: process.env.NEXT_PUBLIC_YOUVERSION_KEY?.slice(0, 10) + '...' });

  try {
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
          let errorBody = {};
          try {
              errorBody = await response.json();
          } catch {
              errorBody = { message: await response.text() || 'No body' };
          }
          console.error('[YouVersion API Error]', {
              status: response.status,
              url,
              body: errorBody,
          });
          throw new Error(`YouVersion API failed: ${response.status} - ${JSON.stringify(errorBody)}`);
      }

      const json = await response.json();
      console.log('[YouVersion API Success]', { path, dataKeys: Object.keys(json) });
      return json;
  } catch (error) {
      console.error("Error fetching from YouVersion proxy:", error);
      if (error instanceof Error) {
          throw error;
      }
      throw new Error("An unknown error occurred while fetching data.");
  }
}

export const getBibles = async (): Promise<Bible[]> => {
    try {
        const query = new URLSearchParams();
        query.append('language_ranges[]', '*'); // Use wildcard for all languages
        const endpoint = `/v1/bibles?${query.toString()}`;
        const jsonResponse = await fetchYouVersionAPI(endpoint);
        return Array.isArray(jsonResponse) ? jsonResponse : jsonResponse?.data || [];
    } catch (err) {
        console.error('Bibles fetch failed:', err);
        return []; // Return empty array on failure
    }
}

export const getBooks = async (bibleId: string): Promise<Book[]> => {
    if (!bibleId) return [];
    try {
        const jsonResponse = await fetchYouVersionAPI(`/v1/bibles/${bibleId}/books`);
        return jsonResponse?.data || [];
    } catch (err) {
        console.error(`Books fetch failed for bibleId ${bibleId}:`, err);
        return [];
    }
}

export const getChapters = async (bibleId: string, bookId: string): Promise<Chapter[]> => {
    if (!bibleId || !bookId) return [];
    try {
        const jsonResponse = await fetchYouVersionAPI(`/v1/bibles/${bibleId}/books/${bookId}/chapters`);
        return jsonResponse?.data || [];
    } catch (err) {
        console.error(`Chapters fetch failed for bibleId ${bibleId}, bookId ${bookId}:`, err);
        return [];
    }
}

export const getPassage = async (bibleId: string, chapterId: string): Promise<Passage | null> => {
    if (!bibleId || !chapterId) {
        console.error('getPassage: Missing bibleId or chapterId');
        return null;
    }
    try {
        const jsonResponse = await fetchYouVersionAPI(`/v1/bibles/${bibleId}/chapters/${chapterId}`);
        const passageData = jsonResponse?.data;
        if (!passageData || !passageData.content) {
            console.warn('Invalid passage response: missing content', passageData);
            return null;
        }
        return passageData as Passage;
    } catch (err) {
        console.error(`Passage fetch failed for bibleId ${bibleId}, chapterId ${chapterId}:`, err);
        return null;
    }
};

export const getSingleVerse = async (bibleId: string, verseId: string): Promise<Passage | null> => {
     if (!bibleId || !verseId) {
        console.error('getSingleVerse: Missing bibleId or verseId');
        return null;
    }
    try {
        const jsonResponse = await fetchYouVersionAPI(`/v1/bibles/${bibleId}/passages/${verseId}`);
        let verseData = jsonResponse;
        if (jsonResponse.data) verseData = jsonResponse.data;
        if (Array.isArray(verseData)) verseData = verseData[0];

        if (!verseData || !verseData.content) {
          console.warn("Invalid VOTD response: missing content", verseData);
          return null;
        }
        return verseData as Passage;
    } catch(err) {
         console.error(`Single verse fetch failed for bibleId ${bibleId}, verseId ${verseId}:`, err);
         return null;
    }
};
