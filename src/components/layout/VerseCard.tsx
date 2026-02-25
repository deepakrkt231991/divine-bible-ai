import { Card } from "@/components/ui/card";
import { Bookmark, Share2, Heart } from "lucide-react";

type VerseCardProps = {
  verse: {
    reference: string;
    content: string;
  },
  bible: {
    abbreviation: string;
  }
}

export default function VerseCard({ verse, bible }: VerseCardProps) {
  return (
    <Card className="bg-card border-accent/30 p-6 hover:border-accent transition-all group shadow-lg">
      <div className="flex justify-between items-start">
        <p className="text-accent text-sm font-medium">{verse.reference}</p>
        <div className="flex gap-4 text-muted-foreground">
          <Heart className="w-5 h-5 cursor-pointer hover:text-red-500 hover:fill-red-500 hover:scale-110 transition-transform" />
          <Bookmark className="w-5 h-5 cursor-pointer hover:text-primary hover:fill-primary hover:scale-110 transition-transform" />
          <Share2 className="w-5 h-5 cursor-pointer hover:text-primary hover:scale-110 transition-transform" />
        </div>
      </div>
      
      <p className="mt-4 text-2xl leading-relaxed font-headline text-card-foreground">
        {verse.content}
      </p>
      
      <p className="text-xs text-muted-foreground mt-6">{bible.abbreviation}</p>
    </Card>
  );
}
