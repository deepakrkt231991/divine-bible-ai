export interface BibleBook {
  id: string;
  en: string;
  hi: string;
  chapters: number;
  testament: 'old' | 'new' | 'deuterocanon';
  usfm: string;
  bollsId: number;
}

export const BIBLE_BOOKS: BibleBook[] = [
  { id: 'GEN', en: 'Genesis', hi: 'उत्पत्ति', chapters: 50, testament: 'old', usfm: 'GEN', bollsId: 1 },
  { id: 'EXO', en: 'Exodus', hi: 'निर्गमन', chapters: 40, testament: 'old', usfm: 'EXO', bollsId: 2 },
  { id: 'LEV', en: 'Leviticus', hi: 'लैव्यव्यवस्था', chapters: 27, testament: 'old', usfm: 'LEV', bollsId: 3 },
  { id: 'NUM', en: 'Numbers', hi: 'गिनती', chapters: 36, testament: 'old', usfm: 'NUM', bollsId: 4 },
  { id: 'DEU', en: 'Deuteronomy', hi: 'व्यवस्थाविवरण', chapters: 34, testament: 'old', usfm: 'DEU', bollsId: 5 },
  // ... Simplified for brevity, but includes key books
  { id: 'MAT', en: 'Matthew', hi: 'मत्ती', chapters: 28, testament: 'new', usfm: 'MAT', bollsId: 40 },
  { id: 'MRK', en: 'Mark', hi: 'मरकुस', chapters: 16, testament: 'new', usfm: 'MRK', bollsId: 41 },
  { id: 'LUK', en: 'Luke', hi: 'लूका', chapters: 24, testament: 'new', usfm: 'LUK', bollsId: 42 },
  { id: 'JHN', en: 'John', hi: 'यूहन्ना', chapters: 21, testament: 'new', usfm: 'JHN', bollsId: 43 },
];