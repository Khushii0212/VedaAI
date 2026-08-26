import { Toaster } from 'sonner';
import './globals.css';

export const metadata = {
  title: 'VedaAI — AI-Powered Assessment Intelligence',
  description: 'Transform handwritten assessments into structured, reviewable insights.',
  keywords: 'AI assessment, handwritten answers, question paper, OCR, education',
  openGraph: {
    title: 'VedaAI — AI-Powered Assessment Intelligence',
    description: 'Transform handwritten assessments into structured, reviewable insights.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
