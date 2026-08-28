import { JourneyDetail } from '@/components/journey/JourneyDetail';

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ journeyId: string }>;
}) {
  const { journeyId } = await params;
  return <JourneyDetail journeyId={journeyId} />;
}
