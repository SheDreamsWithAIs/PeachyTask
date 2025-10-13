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
      <body suppressHydrationWarning className="theme-preload min-h-screen bg-white text-gray-900 dark:bg-stone-950 dark:text-amber-100">
        <style dangerouslySetInnerHTML={{__html: `
          .theme-preload{opacity:0; transition:opacity .2s ease-in}
        `}}/>
        <Script id="peachy-theme-init" strategy="beforeInteractive">{`
          try {
            var t = localStorage.getItem('peachy-theme');
            var isDark = t === 'dark' || (!t && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
            var root = document.documentElement;
            if (isDark) {
              root.classList.add('dark');
              root.style.backgroundColor = '#0c0a09';
            } else {
              root.classList.remove('dark');
              root.style.backgroundColor = '#ffffff';
            }
            // reveal body with fade after first paint
            try{
              var reveal=function(){ try{ document.body.classList.remove('theme-preload'); }catch(e){} };
              if (window.requestAnimationFrame) {
                requestAnimationFrame(function(){ requestAnimationFrame(function(){
                  reveal();
                  try{ root.style.backgroundColor = ''; }catch(e){}
                }); });
              } else {
                setTimeout(function(){ reveal(); try{ root.style.backgroundColor=''; }catch(e){} }, 0);
              }
            }catch(e){}
          } catch (e) {}
        `}</Script>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


