import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Career Club Connect — Local Foundation', description: 'Independent fictional-data career development demo' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
