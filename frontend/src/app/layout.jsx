import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import { ThemeProvider } from '@/components/ThemeContext';
import Script from 'next/script';

export const metadata = {
  title: 'PeachyTask',
  description: 'Task app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="min-h-full">
      <body className="min-h-screen bg-white text-gray-900 dark:bg-stone-950 dark:text-amber-100">
        <Script id="peachy-theme-init" strategy="beforeInteractive">{`
          try {
            var t = localStorage.getItem('peachy-theme');
            if (t === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (e) {}
        `}</Script>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


