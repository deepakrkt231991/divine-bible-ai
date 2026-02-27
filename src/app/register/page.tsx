
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, User, Phone, MapPin, Lock, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const { auth, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '9324401526',
    location: 'Kalyan, Maharashtra',
    password: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setLoading(true);

    try {
      // Firebase Auth Creation
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Update Auth Profile
      await updateProfile(user, { displayName: formData.name });

      // Create Firestore Document
      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.mobile,
        location: formData.location,
        verified: true,
        amenCount: 0,
        readingStreak: 1,
        languagePreference: 'IRV_HIN',
        createdAt: serverTimestamp()
      });

      toast({ title: "Welcome!", description: "Aapka spiritual safar ab shuru hota hai." });
      router.push('/home');
    } catch (error: any) {
      toast({ 
        title: "Registration Failed", 
        description: error.message || "Kuch galat hua. Phir se koshish karein.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-10">
        {/* Branding */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="size-20 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-2xl shadow-emerald-500/10">
            <BookOpen className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold italic text-white tracking-tight">Divine Compass</h1>
            <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em]">Create Your Journey</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl backdrop-blur-sm">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-950 border-zinc-800 rounded-2xl pl-12 h-14 focus:ring-emerald-500/20" 
                  placeholder="Deepak Kadam" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-zinc-950 border-zinc-800 rounded-2xl pl-12 h-14 focus:ring-emerald-500/20" 
                  placeholder="deepak@example.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Mobile Number</Label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="bg-zinc-950 border-zinc-800 rounded-2xl pl-12 h-14 focus:ring-emerald-500/20" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Location</Label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="bg-zinc-950 border-zinc-800 rounded-2xl pl-12 h-14 focus:ring-emerald-500/20" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                  required
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="bg-zinc-950 border-zinc-800 rounded-2xl pl-12 h-14 focus:ring-emerald-500/20" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
          </div>

          <Button 
            disabled={loading}
            className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest text-[11px] py-8 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join the Community'}
          </Button>
        </form>

        <p className="text-center text-[10px] text-zinc-600 font-black uppercase tracking-widest">
          Already a member? <Link href="/login" className="text-emerald-500 hover:underline ml-1">Log In</Link>
        </p>
      </div>
    </div>
  );
}
