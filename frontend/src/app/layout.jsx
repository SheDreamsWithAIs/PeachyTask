import './globals.css';

export const metadata = {
  title: 'PeachyTask',
  description: 'Task app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


