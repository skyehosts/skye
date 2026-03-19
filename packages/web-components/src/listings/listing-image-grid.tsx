import Box from '@mui/material/Box';
import type { IListingImageDto } from '@repo/skye-hosts-api-client';
import { getListingImageUrl } from './listing-image-utils';

interface ListingImageGridProps {
  images: IListingImageDto[];
  title: string;
}

const GAP = 0.5;

export function ListingImageGrid({ images, title }: ListingImageGridProps) {
  const primary = images[0];
  const secondary = images.slice(1, 5);

  if (!primary) {
    return (
      <Box
        sx={{
          width: '100%',
          aspectRatio: '2.5 / 1',
          bgcolor: 'custom.driftwoodSand',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.disabled',
        }}
      >
        No images
      </Box>
    );
  }

  return (
    <Box
      sx={{ display: 'flex', gap: GAP, borderRadius: 2, overflow: 'hidden' }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          component="img"
          src={getListingImageUrl(primary, 1280)}
          alt={`${title} - main image`}
          sx={{
            width: '100%',
            height: '100%',
            aspectRatio: '1.31 / 1',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: GAP,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => {
          const img = secondary[i];
          if (img) {
            return (
              <Box
                key={img.id}
                component="img"
                src={getListingImageUrl(img, 640)}
                alt={`${title} - image ${i + 2}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
              />
            );
          }
          return (
            <Box
              key={`placeholder-${i}`}
              sx={{ bgcolor: 'custom.driftwoodSand' }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
