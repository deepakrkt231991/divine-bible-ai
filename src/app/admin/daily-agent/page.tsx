'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Sparkles } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { dailyVerseAgent, type DailyVerseAgentOutput } from '@/ai/flows/daily-verse-agent';
import { useToast } from '@/hooks/use-toast';

export default function DailyAgent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DailyVerseAgentOutput & { imageUrl: string; date: Date } | null>(null);
  const { toast } = useToast();

  const runAgent = async () => {
    setLoading(true);
    setResult(null);

    try {
      // 1. Gemini call via Genkit flow (Server Action)
      const data = await dailyVerseAgent();

      // 2. Voice generate (client-side browser TTS)
      const utterance = new SpeechSynthesisUtterance(data.explanation);
      utterance.lang = 'hi-IN'; // Hindi voice
      speechSynthesis.speak(utterance);

      // 3. Canvas image generation (client-side)
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Simple background and text for now
        ctx.fillStyle = '#0B0C0D'; // Dark background
        ctx.fillRect(0, 0, 1080, 1080);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.font = 'bold 72px "Playfair Display"';
        ctx.fillText(data.verseReference, 540, 400);

        ctx.font = '48px "Inter"';
        const lines = data.verseTextEnglish.split(' ');
        let currentLine = '';
        let y = 520;
        for (let i = 0; i < lines.length; i++) {
            const testLine = currentLine + lines[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > 980 && i > 0) {
                ctx.fillText(currentLine, 540, y);
                currentLine = lines[i] + ' ';
                y += 60;
            } else {
                currentLine = testLine;
            }
        }
        ctx.fillText(currentLine, 540, y);

        ctx.font = 'italic 32px "Playfair Display"';
        ctx.fillStyle = '#07BF7A'; // Accent color
        ctx.fillText(`- Divine Compass`, 540, 980);

      }

      const imageUrl = canvas.toDataURL('image/png');

      const finalResult = { ...data, imageUrl, date: new Date() };
      setResult(finalResult);

      // 4. Save to Firebase
      await addDoc(collection(db, 'daily_content'), {
          ...finalResult,
          createdAt: serverTimestamp()
      });

      toast({ title: "Agent Run Successful", description: "Daily content has been generated and saved." });

    } catch (error) {
        console.error("Agent failed:", error);
        toast({ title: "Agent Error", description: "Something went wrong while running the agent.", variant: 'destructive'});
    } finally {
        setLoading(false);
    }
  };

  const downloadZip = () => {
    // This is a placeholder as requested.
    // In a real app, you would use a library like JSZip.
    alert('ZIP download initiated! (Full implementation pending)');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-serif text-emerald-400 flex items-center gap-3">
              <Sparkles className="w-8 h-8" /> Daily Verse Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground mb-6">Run this agent to generate the verse of the day, explanation, prayer, and other assets. The result will be saved to Firestore.</p>
            <Button onClick={runAgent} disabled={loading} size="lg" className="w-full text-lg py-7">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Agent is running... 🙏
                </>
              ) : (
                '🚀 Run Daily Agent'
              )}
            </Button>

            {result && (
              <Card className="mt-8 p-6 bg-secondary">
                <h2 className="text-2xl font-serif mb-2">{result.verseReference}</h2>
                <p className="text-muted-foreground mb-4">{result.verseTextEnglish}</p>
                <div className='flex gap-4'>
                    <img src={result.imageUrl} alt="Generated verse" width={200} height={200} className="rounded-md" />
                    <div className='space-y-4'>
                         <h3 className='font-bold'>Generated Content:</h3>
                         <ul className='list-disc list-inside text-sm text-muted-foreground'>
                            <li>Explanation</li>
                            <li>Takeaways</li>
                            <li>Prayer</li>
                            <li>Instagram Content</li>
                            <li>Quiz</li>
                            <li>Song Lyrics</li>
                         </ul>
                    </div>
                </div>
                
                <Button onClick={downloadZip} className="mt-6">
                  <Download className="mr-2" /> Download Full Pack
                </Button>
              </Card>
            )}
          </CardContent>
      </Card>
    </div>
  );
}
