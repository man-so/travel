import { Header } from '@/components/layout/Header';
import { JourneyStart } from '@/components/journey/JourneyStart';

export default function NewJourneyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <JourneyStart />
    </main>
  );
}
