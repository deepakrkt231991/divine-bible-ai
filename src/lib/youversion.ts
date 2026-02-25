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
    const jsonResponse = await fetchYouVersionAPI('/v1/bibles');
    return jsonResponse?.data || [];
}

export const getBooks = async (bibleId: string): Promise<Book[]> => {
    const jsonResponse = await fetchYouVersionAPI(`/v1/bibles/${bibleId}/books`);
    return jsonResponse?.data || [];
}

export const getChapters = async (bibleId: string, bookId: string): Promise<Chapter[]> => {
    const jsonResponse = await fetchYouVersionAPI(`/v1/bibles/${bibleId}/books/${bookId}/chapters`);
    return jsonResponse?.data || [];
}

export const getPassage = async (bibleId: string, chapterId: string): Promise<Passage> => {
    const jsonResponse = await fetchYouVersionAPI(`/v1/bibles/${bibleId}/chapters/${chapterId}`);
    const passageData = jsonResponse?.data;
    if (!passageData || !passageData.content) {
        throw new Error('Invalid passage response: missing content');
    }
    return passageData as Passage;
};

export const getSingleVerse = async (bibleId: string, verseId: string): Promise<Passage> => {
    const jsonResponse = await fetchYouVersionAPI(`/v1/bibles/${bibleId}/passages/${verseId}`);
    // This endpoint returns the object directly, sometimes wrapped in `data`.
    let verseData = jsonResponse?.data || jsonResponse;
    if (Array.isArray(verseData)) verseData = verseData[0];

    if (!verseData || !verseData.content) {
      throw new Error("Invalid VOTD response: missing content");
    }
    return verseData as Passage;
};
