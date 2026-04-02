import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/**
 * Demonstrates Highland-themed MUI Alert variants and Link styling.
 *
 * These components use the same color language as the React Native app's
 * InfoBox (heatherPurple for info, autumnBracken for warning,
 * rowanBerry for error, successGreen for success).
 */
export function HighlandAlerts() {
  return (
    <Stack spacing={3} sx={{ p: 4, maxWidth: 600 }}>
      <Typography variant="h4">Highland Alerts</Typography>
      <Typography variant="body2" color="text.secondary">
        MUI Alert severity variants themed with the Highland palette — matching
        the React Native app&apos;s InfoBox component.
      </Typography>

      <Alert severity="info">
        Your listing is pending review. We&apos;ll notify you once it&apos;s
        approved.
      </Alert>

      <Alert severity="warning">
        Your calendar has gaps that may reduce booking potential. Consider
        adjusting your availability.
      </Alert>

      <Alert severity="error">
        Payment failed. Please update your payment method to avoid service
        interruption.
      </Alert>

      <Alert severity="success">
        Your listing is live and visible to guests. You&apos;re all set!
      </Alert>

      <Typography variant="h5" sx={{ mt: 2 }}>
        Links
      </Typography>
      <Typography variant="body2" color="text.secondary">
        MUI Link styled with deepSkyeBlue to match the app&apos;s link color.
      </Typography>

      <Stack spacing={1}>
        <Link href="#" variant="body1">
          View your listings
        </Link>
        <Link href="#" variant="body2">
          Terms and conditions
        </Link>
        <Typography variant="body1">
          Need help? <Link href="#">Contact support</Link> for assistance.
        </Typography>
      </Stack>
    </Stack>
  );
}
