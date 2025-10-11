import './globals.css';
import { AuthProvider } from '@/components/AuthContext';

export const metadata = {
  title: 'PeachyTask',
  description: 'Task app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="min-h-full">
      <body className="min-h-screen bg-white text-gray-900 dark:bg-stone-950 dark:text-amber-100">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}


