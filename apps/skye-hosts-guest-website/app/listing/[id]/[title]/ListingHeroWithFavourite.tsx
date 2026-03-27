'use client';

import Button from '@mui/material/Button';
import {
  getApiBaseUrl,
  type IListingImageDto,
  type IToggleFavouriteResponseDto,
} from '@repo/skye-hosts-api-client';
import { FavouriteIconContent } from '@repo/web-components/listings/favourite-icon-content';
import { ListingHeroImages } from '@repo/web-components/listings/listing-hero-images';
import { useAuth } from '@repo/web/use-auth';
import { useState } from 'react';

interface ListingHeroWithFavouriteProps {
  listingId: number;
  initialFavourited: boolean;
  images: IListingImageDto[];
  title: string;
  listingTitle?: string;
}

export function ListingHeroWithFavourite({
  listingId,
  initialFavourited,
  images,
  title,
  listingTitle,
}: ListingHeroWithFavouriteProps) {
  const { authFetch, apiToken } = useAuth();
  const [isFavourited, setIsFavourited] = useState(initialFavourited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`${getApiBaseUrl()}/favourite/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ listingId }),
      });

      if (!res.ok) throw new Error('Failed to update favourite');

      const data = await res.json();
      const payload = data.payload as IToggleFavouriteResponseDto;
      setIsFavourited(payload.isFavourited);
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ListingHeroImages
      images={images}
      title={title}
      listingTitle={listingTitle}
      isFavourited={isFavourited}
      onFavouriteToggle={handleToggle}
      isLoadingFavourite={isLoading}
      favouriteButton={
        <Button
          variant="text"
          onClick={handleToggle}
          disabled={isLoading}
          sx={{ color: 'custom.rowanBerry' }}
          startIcon={
            <FavouriteIconContent
              isFavourited={isFavourited}
              isLoading={isLoading}
            />
          }
        >
          {isFavourited ? 'Saved' : 'Save'}
        </Button>
      }
    />
  );
}
