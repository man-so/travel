import { EditJourneyScreen } from '@/components/journey/EditJourneyScreen';

export default async function EditJourneyPage({
  params,
}: {
  params: Promise<{ journeyId: string }>;
}) {
  const { journeyId } = await params;
  return <EditJourneyScreen journeyId={journeyId} />;
}
