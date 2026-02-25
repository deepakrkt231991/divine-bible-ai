'use client';

import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
            <Card>
                <CardHeader className="items-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-2">
                        <User className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="font-serif">Profile</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground">
                        User accounts and profiles are not required for this application. Enjoy your journey through the scriptures!
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
