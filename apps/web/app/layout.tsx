import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth/auth-provider';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'DocuMind AI',
  description: 'Personal AI document intelligence assistant',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // Pre-paint theme initialization prevents a flash of the wrong theme.
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
