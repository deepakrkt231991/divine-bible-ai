import type { Bible, Book, Chapter, Passage } from "@/types";

async function fetchYouVersionAPI<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`/api/youversion?path=${encodeURIComponent(path)}`);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: "An unknown API error occurred" }));
      console.error(`API Error (${response.status}):`, errorBody);
      throw new Error(errorBody.error || `Request failed with status ${response.status}`);
    }
    
    // The YouVersion API wraps its response in a 'data' object
    const jsonResponse = await response.json();
    return jsonResponse.data as T;

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

export const getPassage = (bibleId: string, chapterId: string): Promise<Passage> => fetchYouVersionAPI<Passage>(`/v1/bibles/${bibleId}/chapters/${chapterId}`);

export const getSingleVerse = (bibleId: string, verseId: string): Promise<Passage> => fetchYouVersionAPI<Passage>(`/v1/bibles/${bibleId}/passages/${verseId}`);
