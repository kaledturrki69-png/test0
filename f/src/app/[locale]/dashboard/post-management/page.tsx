import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import JobApplicationForm from '@/features/post-management/components/job-application-form';

export const metadata = {
  title: 'Post Management'
};

export default function PostManagementPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Post Management'
            description='Manage job postings and applications.'
          />
        </div>
        <Separator />
        <JobApplicationForm />
      </div>
    </PageContainer>
  );
}
