import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="gap-1">
        <h1 className="type-title">{title}</h1>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {children}
        {footer ? <div className="border-t border-border pt-4 text-sm">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
