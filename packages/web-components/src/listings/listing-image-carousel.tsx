'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type { IListingImageDto } from '@repo/skye-hosts-api-client';
import { useEffect, useRef, useState } from 'react';
import { getListingImageUrl } from './listing-image-utils';

interface ListingImageCarouselProps {
  images: IListingImageDto[];
  title: string;
  onBack?: () => void;
}

export function ListingImageCarousel({
  images,
  title,
  onBack,
}: ListingImageCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            if (!isNaN(index)) setCurrentIndex(index);
          }
        }
      },
      { root: container, threshold: 0.5 },
    );

    const slides = container.querySelectorAll('[data-index]');
    slides.forEach((slide) => observer.observe(slide));

    return () => observer.disconnect();
  }, [images.length]);

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
        ref={scrollRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {images.map((image, index) => (
          <Box
            key={image.id}
            data-index={index}
            component="img"
            src={getListingImageUrl(image, 960)}
            alt={`${title} - image ${index + 1}`}
            sx={{
              flex: '0 0 100%',
              width: '100%',
              aspectRatio: '1.31 / 1',
              objectFit: 'cover',
              objectPosition: 'center',
              scrollSnapAlign: 'start',
              display: 'block',
            }}
          />
        ))}
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

      <IconButton
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          bgcolor: 'rgba(255,255,255,0.85)',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
          width: 36,
          height: 36,
        }}
      >
        <FavoriteBorderIcon sx={{ fontSize: 20 }} />
      </IconButton>

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
