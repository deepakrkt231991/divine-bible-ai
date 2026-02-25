'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ProfilePage() {
  const { userData, isAdmin, signOut, loading } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-6">
                {loading ? (
                    <>
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <Skeleton className="h-7 w-48 mt-2" />
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-10 w-32 mt-4" />
                    </>
                ) : userData ? (
                    <>
                        <Avatar className="h-24 w-24 border-4 border-primary/50">
                            <AvatarImage src={userData.photoURL || ''} alt={userData.name || 'User'} />
                            <AvatarFallback className="text-3xl bg-muted">{getInitials(userData.name)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 justify-center">
                                <h1 className="text-2xl font-bold">{userData.name}</h1>
                                {isAdmin && <ShieldCheck className="w-5 h-5 text-accent" titleAccess='Admin User' />}
                            </div>
                            <p className="text-muted-foreground">{userData.email}</p>
                        </div>
                        <Button onClick={signOut} variant="destructive">
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </Button>
                    </>
                ) : (
                    <p>Please sign in to view your profile.</p>
                )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
