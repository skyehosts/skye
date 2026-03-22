'use client';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Button, CircularProgress } from '@mui/material';
import { heatherPurple } from '@repo/common/theme/palette';
import {
  getApiBaseUrl,
  type IToggleFavouriteResponseDto,
} from '@repo/skye-hosts-api-client';
import { useAuth } from '@repo/web/use-auth';
import { useState } from 'react';

interface FavouriteButtonProps {
  listingId: number;
  initialFavourited: boolean;
}

export function FavouriteButton({
  listingId,
  initialFavourited,
}: FavouriteButtonProps) {
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

      if (!res.ok) {
        throw new Error('Failed to update favourite');
      }

      const data = await res.json();
      const payload = data.payload as IToggleFavouriteResponseDto;
      setIsFavourited(payload.isFavourited);
    } catch {
      // Revert optimistic state not needed since we wait for response
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="text"
      onClick={handleToggle}
      disabled={isLoading}
      startIcon={
        isLoading ? (
          <CircularProgress size={18} />
        ) : isFavourited ? (
          <FavoriteIcon sx={{ color: heatherPurple }} />
        ) : (
          <FavoriteBorderIcon sx={{ color: heatherPurple }} />
        )
      }
      sx={{ mt: 2 }}
    >
      {isFavourited ? 'Remove from favourites' : 'Add to favourites'}
    </Button>
  );
}
