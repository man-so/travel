import { Header } from '@/components/layout/Header';
import { JourneyForm } from '@/components/journey/JourneyForm';

export default function NewJourneyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <JourneyForm />
    </main>
  );
}
