import "./globals.css";
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
export const metadata = {
  title: "CricVerse | Ultimate Cricket Platform",
  description: "The digital ecosystem for cricket players. Build teams, enter tournaments, and track stats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <Toaster position="top-center" toastOptions={{
            style: { background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)' }
          }} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
