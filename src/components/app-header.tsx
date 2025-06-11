import { Target } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex items-center gap-3">
        <Target className="h-8 w-8" />
        <h1 className="text-3xl font-headline font-semibold">OutreachAI</h1>
      </div>
    </header>
  );
}
