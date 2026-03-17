
export interface BibleBook {
  id: string | number;
  en: string;
  hi: string;
  usfm: string;
  testament: 'old' | 'new' | 'deuterocanon';
  chapters: number;
  bollsId: number;
}

export const BIBLE_BOOKS: BibleBook[] = [
  // OLD TESTAMENT
  { id: 1, en: "Genesis", hi: "उत्पत्ति", usfm: "GEN", testament: 'old', chapters: 50, bollsId: 1 },
  { id: 2, en: "Exodus", hi: "निर्गमन", usfm: "EXO", testament: 'old', chapters: 40, bollsId: 2 },
  { id: 3, en: "Leviticus", hi: "लैव्यव्यवस्था", usfm: "LEV", testament: 'old', chapters: 27, bollsId: 3 },
  { id: 4, en: "Numbers", hi: "गिनती", usfm: "NUM", testament: 'old', chapters: 36, bollsId: 4 },
  { id: 5, en: "Deuteronomy", hi: "व्यवस्थाविवरण", usfm: "DEU", testament: 'old', chapters: 34, bollsId: 5 },
  { id: 19, en: "Psalms", hi: "भजन संहिता", usfm: "PSA", testament: 'old', chapters: 150, bollsId: 19 },
  { id: 20, en: "Proverbs", hi: "नीतिवचन", usfm: "PRO", testament: 'old', chapters: 31, bollsId: 20 },
  
  // APOCRYPHA (DEUTEROCANON)
  { id: 67, en: "Tobit", hi: "तोबीत", usfm: "TOB", testament: 'deuterocanon', chapters: 14, bollsId: 67 },
  { id: 68, en: "Judith", hi: "यूदीत", usfm: "JDT", testament: 'deuterocanon', chapters: 16, bollsId: 68 },
  { id: 69, en: "Wisdom", hi: "सुलेमान का विवेक", usfm: "WIS", testament: 'deuterocanon', chapters: 19, bollsId: 69 },
  { id: 70, en: "Sirach", hi: "सिराख", usfm: "SIR", testament: 'deuterocanon', chapters: 51, bollsId: 70 },
  
  // NEW TESTAMENT
  { id: 40, en: "Matthew", hi: "मत्ती", usfm: "MAT", testament: 'new', chapters: 28, bollsId: 40 },
  { id: 41, en: "Mark", hi: "मरकुस", usfm: "MRK", testament: 'new', chapters: 16, bollsId: 41 },
  { id: 42, en: "Luke", hi: "लूका", usfm: "LUK", testament: 'new', chapters: 24, bollsId: 42 },
  { id: 43, en: "John", hi: "यूहन्ना", usfm: "JHN", testament: 'new', chapters: 21, bollsId: 43 },
  { id: 44, en: "Acts", hi: "प्रेरितों के काम", usfm: "ACT", testament: 'new', chapters: 28, bollsId: 44 },
  { id: 45, en: "Romans", hi: "रोमियों", usfm: "ROM", testament: 'new', chapters: 16, bollsId: 45 },
  { id: 66, en: "Revelation", hi: "प्रकाशितवाक्य", usfm: "REV", testament: 'new', chapters: 22, bollsId: 66 },
];
