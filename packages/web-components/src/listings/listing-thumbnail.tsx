import Box from '@mui/material/Box';

interface ListingThumbnailProps {
  coverImageUrl: string | null;
  alt: string;
}

export function ListingThumbnail({
  coverImageUrl,
  alt,
}: ListingThumbnailProps) {
  return (
    <Box
      sx={{
        width: 215,
        height: 205,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'custom.driftwoodSand',
      }}
    >
      {coverImageUrl ? (
        <Box
          component="img"
          src={coverImageUrl}
          alt={alt}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.disabled',
            fontSize: 14,
          }}
        >
          No image
        </Box>
      )}
    </Box>
  );
}
