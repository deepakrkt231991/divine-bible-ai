import { ClipboardList } from 'lucide-react';

export default function PlansPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center min-h-[calc(100vh-8rem)]">
      <div className="p-6 bg-primary/10 rounded-full mb-6">
        <ClipboardList className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-3xl font-headline mb-4">Reading Plans</h1>
      <p className="text-muted-foreground max-w-md">Coming soon! We're preparing curated plans to guide your study and help you grow in your faith journey.</p>
    </div>
  );
}
