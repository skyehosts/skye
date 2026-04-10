import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { AmenityRow } from './amenity-icon';

export const thingsToKnowModalStyles: Record<string, SxProps<Theme>> = {
  subtitle: {
    color: 'text.secondary',
    mb: 3,
  },
  sectionTitle: {
    fontWeight: 600,
    mb: 1.5,
    mt: 3,
    '&:first-of-type': { mt: 0 },
  },
  listItem: {
    py: 1,
    borderBottom: 1,
    borderColor: 'divider',
  },
};

export interface LineItem {
  icon: string;
  label: string;
}

export function parseTriStateYesItems(
  entries: string[],
  config: { id: string; title: string; icon: string }[],
): LineItem[] {
  const yesIds = new Set<string>();
  for (const entry of entries) {
    const separatorIndex = entry.indexOf(':');
    if (separatorIndex === -1) continue;
    const id = entry.substring(0, separatorIndex);
    const value = entry.substring(separatorIndex + 1);
    if (value === 'yes') yesIds.add(id);
  }
  return config
    .filter((item) => yesIds.has(item.id))
    .map((item) => ({ icon: item.icon, label: item.title }));
}

export function ModalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={thingsToKnowModalStyles.sectionTitle}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export function ItemList({ items }: { items: LineItem[] }) {
  return (
    <Box>
      {items.map((item, i) => (
        <Box key={i} sx={thingsToKnowModalStyles.listItem}>
          <AmenityRow icon={item.icon} title={item.label} />
        </Box>
      ))}
    </Box>
  );
}
