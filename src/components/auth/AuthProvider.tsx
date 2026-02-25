'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

export interface UserData {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const protectedRoutes = ['/home', '/read', '/ai', '/plans', '/profile'];
const adminRoutes = ['/admin'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const fetchedUserData = userSnap.data() as UserData;
          setUser(user);
          setUserData(fetchedUserData);
        } else {
          // Create new user document in Firestore
          const newUser: UserData = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            // Admin check as per blueprint, replace with your admin email
            isAdmin: user.email === 'admin@example.com',
          };
          await setDoc(userRef, newUser);
          setUser(user);
          setUserData(newUser);
        }
        
        if (pathname === '/') {
          router.push('/home');
        }

      } else {
        setUser(null);
        setUserData(null);
        if (protectedRoutes.some(route => pathname.startsWith(route)) || adminRoutes.some(route => pathname.startsWith(route))) {
          router.push('/');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const isAdmin = userData?.isAdmin || false;

  useEffect(() => {
    if (!loading && user && adminRoutes.some(route => pathname.startsWith(route)) && !isAdmin) {
      router.push('/home'); // Redirect non-admins from admin routes
    }
  }, [loading, user, isAdmin, pathname, router]);

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/');
  };

  const value = { user, userData, isAdmin, loading, signOut };
  
  if (loading && (protectedRoutes.some(route => pathname.startsWith(route)) || adminRoutes.some(route => pathname.startsWith(route)) || pathname === '/')) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
           <div className="p-4 bg-primary/10 rounded-full">
            <BookOpen className="w-10 h-10 text-primary animate-pulse" />
           </div>
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
