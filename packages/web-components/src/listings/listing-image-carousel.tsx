'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type { IListingImageDto } from '@repo/skye-hosts-api-client';
import { useRef, useState } from 'react';
import { FavouriteIconContent } from './favourite-icon-content';
import { getListingImageUrl } from './listing-image-utils';

interface ListingImageCarouselProps {
  images: IListingImageDto[];
  title: string;
  onBack?: () => void;
  isFavourited?: boolean;
  onFavouriteToggle?: () => void;
  isLoadingFavourite?: boolean;
}

export function ListingImageCarousel({
  images,
  title,
  onBack,
  isFavourited,
  onFavouriteToggle,
  isLoadingFavourite,
}: ListingImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = touchStartX.current - endX;
    if (Math.abs(delta) < 30) return;
    setCurrentIndex((prev) =>
      delta > 0 ? Math.min(prev + 1, images.length - 1) : Math.max(prev - 1, 0),
    );
  };

  if (images.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          aspectRatio: '1.31 / 1',
          bgcolor: 'custom.driftwoodSand',
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
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        sx={{ overflow: 'hidden', width: '100%' }}
      >
        <Box
          sx={{
            display: 'flex',
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.3s ease',
            willChange: 'transform',
          }}
        >
          {images.map((image, index) => (
            <Box
              key={image.id}
              component="img"
              src={getListingImageUrl(image, 960)}
              alt={`${title} - image ${index + 1}`}
              sx={{
                flex: '0 0 100%',
                width: '100%',
                aspectRatio: '1.31 / 1',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
            />
          ))}
        </Box>
      </Box>

      {onBack && (
        <IconButton
          onClick={onBack}
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: 'rgba(255,255,255,0.85)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
            width: 36,
            height: 36,
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
      )}

      {onFavouriteToggle && (
        <IconButton
          onClick={onFavouriteToggle}
          disabled={isLoadingFavourite}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(255,255,255,0.85)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
            width: 44,
            height: 44,
          }}
        >
          <FavouriteIconContent
            isFavourited={isFavourited}
            isLoading={isLoadingFavourite}
            size={24}
          />
        </IconButton>
      )}

      <Typography
        variant="body2"
        sx={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          bgcolor: 'rgba(0,0,0,0.6)',
          color: '#fff',
          px: 1,
          py: 0.25,
          borderRadius: 1,
          fontSize: 13,
        }}
      >
        {currentIndex + 1} / {images.length}
      </Typography>
    </Box>
  );
}
