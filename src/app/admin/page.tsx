import AudioGenerator from '@/components/admin/AudioGenerator';
import StatusMaker from '@/components/admin/StatusMaker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif mb-8">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        <Link href="/admin/daily-agent" className='block hover:scale-[1.02] transition-transform'>
            <Card className='h-full bg-primary/5 border-primary/20 hover:border-primary'>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-primary'>
                        <Sparkles />
                        Daily Verse Agent
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>Run the AI agent to generate the verse of the day content pack.</CardDescription>
                </CardContent>
                 <CardContent>
                    <div className='flex items-center text-sm font-medium text-primary'>
                        Go to Agent <ArrowRight className='ml-2 h-4 w-4' />
                    </div>
                </CardContent>
            </Card>
        </Link>

        <AudioGenerator />
        <StatusMaker />
      </div>
    </div>
  );
}
