import type {Metadata} from 'next';
import { Inter, Playfair_Display } from "next/font/google";
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'Divine Compass',
  description: 'Your guide to the scriptures. Read, reflect, and grow in your faith.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${playfair.variable} font-sans bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
