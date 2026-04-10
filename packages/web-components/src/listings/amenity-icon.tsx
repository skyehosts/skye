'use client';

import Icon from '@mdi/react';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { mdiFallbackIcon, mdiIconMap } from './mdi-amenity-icon-map';

export interface AmenityIconProps {
  name: string;
  size?: number;
  color?: string;
}

export function AmenityIcon({ name, size = 28, color }: AmenityIconProps) {
  const theme = useTheme();
  const resolvedColor = color ?? theme.palette.custom.seaGlassTeal;
  const path = mdiIconMap[name] ?? mdiFallbackIcon;
  return <Icon path={path} size={`${size}px`} color={resolvedColor} />;
}

export function AmenityRow({ icon, title }: { icon: string; title: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <AmenityIcon name={icon} />
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', fontSize: '1rem' }}
      >
        {title}
      </Typography>
    </Stack>
  );
}
