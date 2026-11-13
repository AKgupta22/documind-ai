interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="grid gap-4 py-6 md:grid-cols-[220px_1fr] md:gap-8">
      <div>
        <h2 className="type-heading">{title}</h2>
        <p className="mt-1 text-sm text-foreground-secondary">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
