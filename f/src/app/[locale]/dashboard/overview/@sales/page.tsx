import { delay } from '@/constants/mock-api';
import { TopMatches } from '@/features/overview/components/top-maches';

export default async function Sales() {
  await delay(3000);
  return <TopMatches />;
}
