import type { Metadata } from 'next';
import './globals.css';
import CookieNotice from '../components/CookieNotice';
export const metadata: Metadata = { title: 'Career Club Connect | Learn, Connect & Grow', description: 'A community platform for Career Club members to share experiences, build connections, and grow their careers.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<CookieNotice /></body></html>;
}
