import { PlayCircle } from 'lucide-react';

export default function AudioPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center min-h-[calc(100vh-8rem)]">
      <div className="p-6 bg-primary/10 rounded-full mb-6">
        <PlayCircle className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-3xl font-serif mb-4">Audio Bible</h1>
      <p className="text-muted-foreground max-w-md">Coming soon! Listen to the scriptures on the go.</p>
    </div>
  );
}
