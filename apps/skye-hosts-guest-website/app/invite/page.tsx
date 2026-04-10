import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { APP_DISPLAY_NAME } from '@repo/common';
import {
  fetchApi,
  type IGetCoHostInviteDetailsResponseDto,
} from '@repo/skye-hosts-api-client';
import { PageContainer } from '@repo/web-components/layout/page-container';

const ROLE_LABELS: Record<string, string> = {
  full_access: 'Full Access',
  calendar_and_messaging: 'Calendar & Messaging',
  calendar_only: 'Calendar Only',
};

const APP_STORE_URL = 'https://apps.apple.com/app/TODO_APP_ID';
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=uk.co.skyehosts';

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <PageContainer>
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5">Invalid invite link</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            This invite link is missing a token. Please check the link and try
            again.
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  let invite: IGetCoHostInviteDetailsResponseDto | null = null;
  let error: string | null = null;

  try {
    invite = await fetchApi<IGetCoHostInviteDetailsResponseDto>(
      `/co-host-invite/details/${token}`,
    );
  } catch {
    error = 'This invite could not be found or has expired.';
  }

  if (error || !invite) {
    return (
      <PageContainer>
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5">Invite not found</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {error}
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 480, width: '100%' }}>
          <Typography variant="h5" gutterBottom>
            Co-Host Invite
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {invite.inviterName} has invited you to co-host{' '}
            <strong>{invite.listingTitle}</strong> as{' '}
            <strong>{ROLE_LABELS[invite.role] ?? invite.role}</strong>.
          </Typography>

          {invite.status !== 'pending' && (
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              This invite has been {invite.status}.
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            To accept this invite, open it in the {APP_DISPLAY_NAME} app.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" href={APP_STORE_URL}>
              App Store
            </Button>
            <Button variant="outlined" href={PLAY_STORE_URL}>
              Google Play
            </Button>
          </Box>
        </Paper>
      </Box>
    </PageContainer>
  );
}
