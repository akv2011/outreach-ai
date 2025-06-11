import { AppHeader } from '@/components/app-header';
import { OutreachDashboard } from '@/components/outreach-dashboard';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <OutreachDashboard />
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} OutreachAI. All rights reserved.
      </footer>
    </div>
  );
}
