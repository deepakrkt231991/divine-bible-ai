import type { Bible, Book, Chapter, Passage } from "@/types";

async function fetchYouVersionAPI<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`/api/youversion?path=${encodeURIComponent(path)}`);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: "An unknown API error occurred" }));
      console.error(`API Error (${response.status}):`, errorBody);
      throw new Error(errorBody.error || `Request failed with status ${response.status}`);
    }
    
    const jsonResponse = await response.json();
    // The YouVersion API sometimes wraps its response in a 'data' object.
    // If the data wrapper exists, return it, otherwise return the whole response.
    return (jsonResponse.data ?? jsonResponse) as T;

  } catch (error) {
    console.error("Error fetching from YouVersion proxy:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred while fetching data.");
  }
}

export const getBibles = (): Promise<Bible[]> => fetchYouVersionAPI<Bible[]>('/v1/bibles');

export const getBooks = (bibleId: string): Promise<Book[]> => fetchYouVersionAPI<Book[]>(`/v1/bibles/${bibleId}/books`);

export const getChapters = (bibleId: string, bookId: string): Promise<Chapter[]> => fetchYouVersionAPI<Chapter[]>(`/v1/bibles/${bibleId}/books/${bookId}/chapters`);

export const getPassage = async (bibleId: string, chapterId: string): Promise<Passage> => {
    let passageData = await fetchYouVersionAPI<any>(`/v1/bibles/${bibleId}/chapters/${chapterId}`);
    if (Array.isArray(passageData)) {
        passageData = passageData[0];
    }
    if (!passageData || !passageData.content) {
        throw new Error('Invalid passage response: missing content');
    }
    return passageData as Passage;
};

export const getSingleVerse = async (bibleId: string, verseId: string): Promise<Passage> => {
    let passageData = await fetchYouVersionAPI<any>(`/v1/bibles/${bibleId}/passages/${verseId}`);
    if (Array.isArray(passageData)) {
        passageData = passageData[0];
    }
    if (!passageData || !passageData.content) {
        throw new Error('Invalid verse response: missing content');
    }
    return passageData as Passage;
};
