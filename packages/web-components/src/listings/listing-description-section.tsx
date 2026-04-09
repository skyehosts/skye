'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState } from 'react';
import { ListingDescriptionModal } from './listing-description-modal';

interface DescriptionField {
  heading: string;
  content: string;
  hideHeadingInModal?: boolean;
}

export interface ListingDescriptionSectionProps {
  description: string;
  descriptionLong: string;
  guestAccess: string;
  otherDetailsToNote: string;
}

const CHAR_LIMIT = 450;

function truncateDescriptionFields(
  fields: DescriptionField[],
  limit: number,
): { displayFields: DescriptionField[]; isTruncated: boolean } {
  const totalChars = fields.reduce((sum, f) => sum + f.content.length, 0);
  if (totalChars <= limit) {
    return { displayFields: fields, isTruncated: false };
  }

  const displayFields: DescriptionField[] = [];
  let remaining = limit;

  for (const field of fields) {
    if (field.content.length <= remaining) {
      displayFields.push(field);
      remaining -= field.content.length;
    } else {
      // Truncate at last word boundary
      const slice = field.content.slice(0, remaining);
      const lastSpace = slice.lastIndexOf(' ');
      const truncated = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
      displayFields.push({
        ...field,
        content: truncated + '...',
      });
      break;
    }
  }

  return { displayFields, isTruncated: true };
}

export function ListingDescriptionSection({
  description,
  descriptionLong,
  guestAccess,
  otherDetailsToNote,
}: ListingDescriptionSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

  const allFields: DescriptionField[] = [
    {
      heading: 'About this place',
      content: description,
      hideHeadingInModal: true,
    },
    {
      heading: 'The property',
      content: descriptionLong,
      hideHeadingInModal: true,
    },
    { heading: 'Guest access', content: guestAccess },
    { heading: 'Other things to note', content: otherDetailsToNote },
  ].filter((f) => f.content.length > 0);

  if (allFields.length === 0) return null;

  const { displayFields, isTruncated } = truncateDescriptionFields(
    allFields,
    CHAR_LIMIT,
  );

  return (
    <Box
      sx={{
        py: 4,
        borderBottom: 1,
        borderColor: 'divider',
        textAlign: { xs: 'center', md: 'left' },
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, color: 'custom.grey950', mb: 1, fontSize: 22 }}
      >
        About this place
      </Typography>
      {displayFields.map((field, index) => (
        <Typography
          key={field.heading}
          variant="body1"
          sx={{
            color: 'text.secondary',
            whiteSpace: 'pre-line',
            mb: index < displayFields.length - 1 ? 1.5 : 0,
          }}
        >
          {field.content}
        </Typography>
      ))}

      {isTruncated && (
        <Button
          variant="contained"
          onClick={() => setModalOpen(true)}
          aria-expanded={modalOpen}
          aria-haspopup="dialog"
          sx={{ mt: 1.5 }}
        >
          Show more
        </Button>
      )}

      <ListingDescriptionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fields={allFields}
        fullScreen={isMobile}
      />
    </Box>
  );
}
