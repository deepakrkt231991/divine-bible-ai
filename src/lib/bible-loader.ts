// src/lib/bible-loader.ts
// ✅ Re-exports for easy imports

// Server-side exports (for API routes, SSR)
export { 
  ALIASES, getCode, loadChapter, loadBook, loadForGemini,
  Verse, BibleBook, BibleData, SplitChapter 
} from './bible-loader.server';

// Client-side exports (for React components)
export { useChapter } from './bible-loader.client';