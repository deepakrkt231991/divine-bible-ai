'use client';

import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { BookOpen, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            ></path>
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            ></path>
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            ></path>
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            ></path>
            <path d="M1 1h22v22H1z" fill="none"></path>
        </svg>
    )
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The AuthProvider will handle the redirect
    } catch (error) {
      console.error('Error signing in with Google', error);
      toast({
        title: "Sign-in Failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      })
      setIsSigningIn(false);
    }
  };

  // AuthProvider shows its own loading screen, so we can just return null
  // if the user is logged in or auth is still loading.
  if (authLoading || user) {
    return null; 
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
       <div className="relative z-10 flex flex-col items-center">
        <div className="mb-6 inline-block p-4 bg-primary/10 rounded-full border-8 border-background/50 shadow-lg">
            <BookOpen className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline text-foreground mb-3">
          Divine Compass
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Your guide to the scriptures. Read, reflect, and grow in your faith.
        </p>
        <div className="mt-12">
            <Button onClick={handleSignIn} size="lg" disabled={isSigningIn}>
              {isSigningIn ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Sign in with Google</span>
                </>
              )}
            </Button>
        </div>
      </div>
    </div>
  );
}
