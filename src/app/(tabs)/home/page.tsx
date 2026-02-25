'use client';

import { useEffect, useState } from 'react';
import VerseCard from '@/components/layout/VerseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Sparkles, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { getSingleVerse } from '@/lib/youversion';
import type { Passage } from '@/types';

const BIBLE_VERSION_ID = '3034'; // ID from working cURL example
const VERSE_OF_THE_DAY_ID = 'JHN.3.16';

const QuickLink = ({ href, icon: Icon, title, description }: { href: string, icon: React.ElementType, title: string, description: string }) => (
    <Link href={href} className="block group">
        <div className="bg-card p-4 rounded-lg flex items-center gap-4 hover:bg-secondary transition-colors h-full">
            <div className="p-3 bg-secondary rounded-lg group-hover:bg-primary/10 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
                <h3 className="font-semibold text-card-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    </Link>
)

export default function HomePage() {
  const [verseOfTheDay, setVerseOfTheDay] = useState<{ reference: string; content: string } | null>(null);
  const [bibleVersion, setBibleVersion] = useState<{ abbreviation: string } | null>(null);
  const [verseLoading, setVerseLoading] = useState(true);

  useEffect(() => {
    const fetchVerse = async () => {
      setVerseLoading(true);
      // Check for API key. If missing, use fallback and avoid API call.
      if (!process.env.NEXT_PUBLIC_YOUVERSION_KEY) {
        console.warn("YouVersion API key not found. Using fallback verse. Please set NEXT_PUBLIC_YOUVERSION_KEY in your .env file.");
        setVerseOfTheDay({
          reference: "John 3:16",
          content: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
        });
        setBibleVersion({ abbreviation: "KJV" });
        setVerseLoading(false);
        return;
      }
      
      try {
        const passage: Passage = await getSingleVerse(BIBLE_VERSION_ID, VERSE_OF_THE_DAY_ID);

        if (!passage || !passage.content || !passage.reference) {
          throw new Error("Failed to fetch verse: API returned invalid data.");
        }

        const plainTextContent = passage.content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
        const referenceText = typeof passage.reference === 'string' ? passage.reference : passage.reference.human;
        
        setVerseOfTheDay({
          reference: referenceText,
          content: plainTextContent,
        });
        setBibleVersion({ abbreviation: 'NIV' }); // Assuming NIV based on text
      } catch (error) {
        console.error("Failed to fetch verse of the day:", error);
        // Fallback to a default verse if the API fails
        setVerseOfTheDay({
          reference: "John 3:16",
          content: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
        });
        setBibleVersion({ abbreviation: "KJV" });
      } finally {
        setVerseLoading(false);
      }
    };
    fetchVerse();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl font-serif">
                    Welcome, friend
                </h1>
                <p className="text-muted-foreground">Let's dive into the Word today.</p>
            </div>
            
            <h2 className="text-xl font-serif font-bold text-accent mb-4">Verse of the Day</h2>
             {verseLoading || !verseOfTheDay || !bibleVersion ? (
              <Skeleton className="h-48 w-full rounded-lg" />
            ) : (
              <VerseCard verse={verseOfTheDay} bible={bibleVersion} />
            )}
          </div>
      </div>

      <div className="container mx-auto px-4 pb-8 space-y-6">
        <h2 className="text-xl font-serif font-bold">Get Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickLink href="/read" icon={BookOpen} title="Read Scripture" description="Explore the Bible chapter by chapter." />
            <QuickLink href="/ai" icon={Sparkles} title="AI Assistant" description="Ask questions and get insights." />
            <QuickLink href="/plans" icon={ClipboardList} title="Reading Plans" description="Follow guided study plans." />
        </div>
      </div>
    </div>
  );
}
