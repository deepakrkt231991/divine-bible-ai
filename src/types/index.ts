export interface Bible {
    id: string;
    abbreviation: string;
    abbreviationLocal: string;
    name: string;
    nameLocal: string;
    description: string | null;
    descriptionLocal: string | null;
    language: {
        id: string;
        name: string;
        nameLocal: string;
        script: string;
    };
    countries: any[];
    type: string;
    updatedAt: string;
    audioBibles: any[];
}

export interface Book {
    id: string;
    bibleId: string;
    abbreviation: string;
    name: string;
    nameLong: string;
}

export interface Chapter {
    id: string;
    bibleId: string;
    bookId: string;
    number: string;
    reference: string;
}

export interface Passage {
    id: string;
    bibleId: string;
    orgId: string;
    bookId: string;
    chapterIds: string[];
    reference: {
        human: string;
        usfm: string[];
    };
    content: string;
    verseCount: number;
    copyright: string;
}
