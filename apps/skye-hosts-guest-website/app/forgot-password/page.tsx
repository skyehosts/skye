import { FormCard } from '@repo/web-components/layout/form-card';
import { PageContainer } from '@repo/web-components/layout/page-container';
import { ForgotPasswordFormWrapper } from './ForgotPasswordFormWrapper';

export default function ForgotPasswordPage() {
  return (
    <PageContainer>
      <FormCard title="Forgot password">
        <ForgotPasswordFormWrapper />
      </FormCard>
    </PageContainer>
  );
}
