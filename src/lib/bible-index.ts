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
  { id: 'JOS', en: 'Joshua', hi: 'यहोशू', chapters: 24, testament: 'old', usfm: 'JOS', bollsId: 6 },
  { id: 'JDG', en: 'Judges', hi: 'न्यायियों', chapters: 21, testament: 'old', usfm: 'JDG', bollsId: 7 },
  { id: 'RUT', en: 'Ruth', hi: 'रूत', chapters: 4, testament: 'old', usfm: 'RUT', bollsId: 8 },
  { id: '1SA', en: '1 Samuel', hi: '1 शमूएल', chapters: 31, testament: 'old', usfm: '1SA', bollsId: 9 },
  { id: '2SA', en: '2 Samuel', hi: '2 शमूएल', chapters: 24, testament: 'old', usfm: '2SA', bollsId: 10 },
  
  // Apocrypha / Deuterocanon (81 Book support)
  { id: 'TOB', en: 'Tobit', hi: 'तोबीत', chapters: 14, testament: 'deuterocanon', usfm: 'TOB', bollsId: 67 },
  { id: 'JDT', en: 'Judith', hi: 'यहूदीत', chapters: 16, testament: 'deuterocanon', usfm: 'JDT', bollsId: 68 },
  { id: 'WIS', en: 'Wisdom', hi: 'सुलेमान का ज्ञान', chapters: 19, testament: 'deuterocanon', usfm: 'WIS', bollsId: 69 },
  { id: 'SIR', en: 'Sirach', hi: 'सिराख', chapters: 51, testament: 'deuterocanon', usfm: 'SIR', bollsId: 70 },
  
  { id: 'MAT', en: 'Matthew', hi: 'मत्ती', chapters: 28, testament: 'new', usfm: 'MAT', bollsId: 40 },
  { id: 'MRK', en: 'Mark', hi: 'मरकुस', chapters: 16, testament: 'new', usfm: 'MRK', bollsId: 41 },
  { id: 'LUK', en: 'Luke', hi: 'लूका', chapters: 24, testament: 'new', usfm: 'LUK', bollsId: 42 },
  { id: 'JHN', en: 'John', hi: 'यूहन्ना', chapters: 21, testament: 'new', usfm: 'JHN', bollsId: 43 },
  { id: 'ACT', en: 'Acts', hi: 'प्रेरितों के काम', chapters: 28, testament: 'new', usfm: 'ACT', bollsId: 44 },
  { id: 'ROM', en: 'Romans', hi: 'रोमियों', chapters: 16, testament: 'new', usfm: 'ROM', bollsId: 45 },
];