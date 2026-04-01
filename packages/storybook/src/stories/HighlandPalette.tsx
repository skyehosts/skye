import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  deepSkyeBlue,
  driftwoodSand,
  heatherPurple,
  highlandMossGreen,
  seaGlassTeal,
  successGreen,
  warmStone,
  whiskyGold,
} from "@repo/theme";

const ACCENT_SWATCHES = [
  { label: "Heather Purple", colour: heatherPurple },
  { label: "Warm Stone", colour: warmStone },
  { label: "Driftwood Sand", colour: driftwoodSand },
  { label: "Sea Glass Teal", colour: seaGlassTeal },
] as const;

/**
 * Visual reference for the Highland-inspired colour palette
 * used across Skye Hosts applications.
 */
export function HighlandPalette() {
  return (
    <Stack spacing={3} sx={{ p: 4, maxWidth: 600 }}>
      <Typography variant="h4">Highland Palette</Typography>

      {/* Primary & Secondary buttons */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          sx={{ bgcolor: deepSkyeBlue, "&:hover": { bgcolor: "#163038" } }}
        >
          Primary (Deep Skye Blue)
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: highlandMossGreen,
            "&:hover": { bgcolor: "#4e6a3d" },
          }}
        >
          Secondary (Moss Green)
        </Button>
      </Stack>

      {/* Deal badge — Whisky Gold */}
      <Chip
        label="Best Deal — Save 20%"
        sx={{
          bgcolor: whiskyGold,
          color: deepSkyeBlue,
          fontWeight: 700,
          fontSize: "0.875rem",
          alignSelf: "flex-start",
        }}
      />

      {/* Savings alert — Success Green */}
      <Alert
        severity="success"
        sx={{
          bgcolor: `${successGreen}14`,
          "& .MuiAlert-icon": { color: successGreen },
        }}
      >
        You&apos;re saving £45 compared to other platforms!
      </Alert>

      {/* Accent colour swatches */}
      <Typography variant="h6">Accent Colours</Typography>
      <Stack direction="row" spacing={1}>
        {ACCENT_SWATCHES.map(({ label, colour }) => (
          <Box key={label} sx={{ textAlign: "center" }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1,
                bgcolor: colour,
                mb: 0.5,
              }}
            />
            <Typography variant="caption">{label}</Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
