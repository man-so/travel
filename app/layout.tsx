import type { Metadata } from 'next';
import { Libre_Caslon_Text, Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const libreCaslon = Libre_Caslon_Text({
  variable: '--font-libre-caslon',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'WAYLOG',
  description: 'A visual travel diary for places, moments, and memories.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${libreCaslon.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
