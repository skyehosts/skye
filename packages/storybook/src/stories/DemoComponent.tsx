import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CabinIcon from "@mui/icons-material/Cabin";
import StarIcon from "@mui/icons-material/Star";

export type DemoCardVariant = "elevation" | "outlined";
export type DemoCardColor = "primary" | "success" | "warning" | "error";

export interface DemoComponentProps {
  /** Title displayed in the card header */
  title: string;
  /** Supporting subtitle below the title */
  subtitle: string;
  /** Body description text */
  description: string;
  /** Card border style */
  variant: DemoCardVariant;
  /** Colour theme applied to the action button and status chip */
  color: DemoCardColor;
  /** Shadow depth when variant is "elevation" (0–8) */
  elevation: number;
  /** Star rating shown beneath the subtitle (0–5) */
  rating: number;
  /** Whether to show the nature icon in the avatar */
  showIcon: boolean;
  /** Disables the primary action button */
  disabled: boolean;
}

export function DemoComponent({
  title,
  subtitle,
  description,
  variant,
  color,
  elevation,
  rating,
  showIcon,
  disabled,
}: DemoComponentProps) {
  const clampedRating = Math.min(5, Math.max(0, rating));

  return (
    <Box sx={{ minWidth: 340, maxWidth: 420 }}>
      <Card
        variant={variant}
        elevation={variant === "elevation" ? elevation : undefined}
      >
        <CardHeader
          avatar={
            showIcon ? (
              <Avatar sx={{ bgcolor: `${color}.main` }}>
                <CabinIcon />
              </Avatar>
            ) : undefined
          }
          title={
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          }
          subheader={subtitle}
        />

        <CardContent>
          <Stack direction="row" alignItems="center" spacing={0.5} mb={1.5}>
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                sx={{
                  fontSize: 18,
                  color: i < clampedRating ? "gold" : "text.disabled",
                }}
              />
            ))}
            <Typography variant="body2" color="text.secondary">
              {clampedRating.toFixed(1)}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" mb={2}>
            {description}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Chip
              label="Glamping"
              size="small"
              color={color}
              variant="outlined"
            />
            <Chip label="Outdoors" size="small" variant="outlined" />
          </Stack>
        </CardContent>

        <Divider />

        <CardActions sx={{ px: 2, py: 1.5 }}>
          <Button
            variant="contained"
            color={color}
            size="small"
            disabled={disabled}
          >
            Book Now
          </Button>
          <Button
            variant="text"
            color="inherit"
            size="small"
            disabled={disabled}
          >
            Learn More
          </Button>
        </CardActions>
      </Card>

      {disabled && (
        <Alert severity="warning" sx={{ mt: 1.5 }}>
          Booking is currently unavailable for this listing.
        </Alert>
      )}
    </Box>
  );
}
