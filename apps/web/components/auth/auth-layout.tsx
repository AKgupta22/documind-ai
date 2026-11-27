import { Brand } from '@/components/shared/brand';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Brand href="/login" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="px-4 pb-6 text-center text-xs text-foreground-muted">
        Frontend prototype. Email verification, uploads, and AI responses are simulated.
      </footer>
    </div>
  );
}
