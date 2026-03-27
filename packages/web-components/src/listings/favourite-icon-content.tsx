import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CircularProgress from '@mui/material/CircularProgress';

interface FavouriteIconContentProps {
  isFavourited?: boolean;
  isLoading?: boolean;
  size?: number;
}

export function FavouriteIconContent({
  isFavourited,
  isLoading,
  size,
}: FavouriteIconContentProps) {
  if (isLoading) return <CircularProgress size={18} />;
  const iconSx = {
    color: 'custom.rowanBerry',
    ...(size && { fontSize: size }),
  };
  if (isFavourited) return <FavoriteIcon sx={iconSx} />;
  return <FavoriteBorderIcon sx={iconSx} />;
}
