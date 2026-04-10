import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/**
 * Demonstrates the MUI Button variants used across the guest websites,
 * themed to approximately match the host-app (react-native-paper) button
 * roles defined in apps/skye-hosts-app/app/style-guide.tsx.
 *
 * Mapping host-app → MUI:
 *   contained primary  → variant="contained" color="primary"   (deepSkyeBlue)
 *   outlined           → variant="outlined"  color="primary"
 *   text               → variant="text"      color="primary"
 *   contained danger   → variant="contained" color="error"     (rowanBerry)
 *   text danger        → variant="text"      color="error"
 */
export function HighlandButtons() {
  return (
    <Stack spacing={4} sx={{ p: 4, maxWidth: 760 }}>
      <Box>
        <Typography variant="h4">Highland Buttons</Typography>
        <Typography variant="body2" color="text.secondary">
          MUI Button variants used by skye-hosts-guest-website, themed to match
          the host-app style guide colors. Plain MUI — no custom overrides
          beyond the palette.
        </Typography>
      </Box>

      <Section
        title="Primary (contained)"
        caption="Primary CTA — Save, Next, Continue. Maps to host-app contained primary."
      >
        <Button variant="contained">Save</Button>
      </Section>

      <Section
        title="Outlined"
        caption="Secondary action — Locate, Import. Maps to host-app outlined."
      >
        <Button variant="outlined">Locate</Button>
      </Section>

      <Section
        title="Text"
        caption="Tertiary / dismiss — Cancel, Skip. Maps to host-app text."
      >
        <Button variant="text">Cancel</Button>
      </Section>

      <Section
        title="Danger (contained)"
        caption="Sole destructive CTA — Delete listing. Maps to host-app contained danger (rowanBerry)."
      >
        <Button variant="contained" color="error">
          Delete listing
        </Button>
      </Section>

      <Section
        title="Danger (text)"
        caption="Secondary destructive — Remove, Revoke, inline delete."
      >
        <Button variant="text" color="error">
          Remove
        </Button>
      </Section>

      <Section
        title="States"
        caption="Disabled and loading states (apply to any variant/color)."
      >
        <Button variant="contained" disabled>
          Disabled
        </Button>
        <Button
          variant="contained"
          disabled
          startIcon={<CircularProgress size={16} color="inherit" />}
        >
          Saving…
        </Button>
      </Section>

      <Section
        title="Secondary color"
        caption="Brand secondary (highlandMossGreen) — used sparingly."
      >
        <Button variant="contained" color="secondary">
          Secondary
        </Button>
        <Button variant="outlined" color="secondary">
          Secondary
        </Button>
        <Button variant="text" color="secondary">
          Secondary
        </Button>
      </Section>

      <Section title="Sizes" caption="small / medium (default) / large.">
        <Button variant="contained" size="small">
          Small
        </Button>
        <Button variant="contained" size="medium">
          Medium
        </Button>
        <Button variant="contained" size="large">
          Large
        </Button>
      </Section>

      <Section title="With icons" caption="startIcon and endIcon.">
        <Button variant="contained" startIcon={<AddIcon />}>
          Add listing
        </Button>
        <Button variant="outlined" endIcon={<ArrowForwardIcon />}>
          Continue
        </Button>
      </Section>

      <Section
        title="Link button"
        caption="Renders as an anchor — used for app store links etc."
      >
        <Button variant="contained" href="#">
          App Store
        </Button>
        <Button variant="outlined" href="#">
          Play Store
        </Button>
      </Section>
    </Stack>
  );
}

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 1.5 }}
      >
        {caption}
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {children}
      </Stack>
    </Box>
  );
}
