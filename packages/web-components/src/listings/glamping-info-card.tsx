'use client';

import NatureIcon from '@mui/icons-material/Nature';
import StarIcon from '@mui/icons-material/Star';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface GlampingInfoCardProps {
  name: string;
  description: string;
  rating: number;
  tags?: string[];
}

export function GlampingInfoCard({
  name,
  description,
  rating,
  tags = [],
}: GlampingInfoCardProps) {
  return (
    <Card sx={{ maxWidth: 400 }} elevation={3}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <NatureIcon color="success" />
          <Typography variant="h6" component="div">
            {name}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5} mb={2}>
          <StarIcon sx={{ color: 'gold', fontSize: 18 }} />
          <Typography variant="body2" color="text.secondary">
            {rating.toFixed(1)}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {description}
        </Typography>
        {tags.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        )}
      </CardContent>
      <CardActions>
        <Button size="small" variant="contained" color="success">
          Book Now
        </Button>
        <Button size="small" color="inherit">
          Learn More
        </Button>
      </CardActions>
    </Card>
  );
}
