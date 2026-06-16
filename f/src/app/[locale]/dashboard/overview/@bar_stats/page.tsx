import { delay } from '@/constants/mock-api';
import UserInteractionsChart from '@/features/overview/components/app-install-bar';

export default async function BarStats() {
  await await delay(1000);

  return <UserInteractionsChart />;
}
