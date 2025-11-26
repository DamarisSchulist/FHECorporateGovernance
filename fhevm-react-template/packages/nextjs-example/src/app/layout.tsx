import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FHEVM SDK Demo - Next.js',
  description: 'Confidential voting dApp powered by FHEVM SDK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
