import { FormCard } from '@repo/web-components/layout/form-card';
import { PageContainer } from '@repo/web-components/layout/page-container';
import { SignUpFormWrapper } from './SignUpFormWrapper';

export default function SignUpPage() {
  return (
    <PageContainer>
      <FormCard title="Sign up">
        <SignUpFormWrapper />
      </FormCard>
    </PageContainer>
  );
}
