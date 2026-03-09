'use client';

import {
  Box,
  Button,
  Chip,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { IHostListingDto } from '@repo/skye-hosts-api-client';
import { slugify } from '@repo/skye-hosts-api-client';

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  house: 'House',
  apartment: 'Apartment',
  cabin: 'Cabin',
  villa: 'Villa',
  cottage: 'Cottage',
  glamping: 'Glamping',
};

const ROOM_TYPE_LABELS: Record<string, string> = {
  entire_place: 'Entire place',
  private_room: 'Private room',
  shared_room: 'Shared room',
};

const STATUS_COLORS: Record<string, 'success' | 'default' | 'warning'> = {
  active: 'success',
  inactive: 'default',
  draft: 'warning',
};

export interface HostListingsTableProps {
  listings: IHostListingDto[];
}

export function HostListingsTable({ listings }: HostListingsTableProps) {
  if (listings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No listings yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create your first listing to start hosting.
        </Typography>
        <Button variant="contained" href="/create-a-listing">
          Create a listing
        </Button>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Property type</TableCell>
            <TableCell>Room type</TableCell>
            <TableCell align="center">Guests</TableCell>
            <TableCell align="center">Bedrooms</TableCell>
            <TableCell align="center">Bathrooms</TableCell>
            <TableCell>Post code</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listings.map((listing) => (
            <TableRow key={listing.id}>
              <TableCell>
                <Link
                  href={`/listings/${listing.id}/${slugify(listing.title)}`}
                >
                  {listing.title}
                </Link>
              </TableCell>
              <TableCell>
                {PROPERTY_TYPE_LABELS[listing.propertyType] ??
                  listing.propertyType}
              </TableCell>
              <TableCell>
                {ROOM_TYPE_LABELS[listing.roomType] ?? listing.roomType}
              </TableCell>
              <TableCell align="center">{listing.maxGuests}</TableCell>
              <TableCell align="center">{listing.bedrooms}</TableCell>
              <TableCell align="center">{listing.bathrooms}</TableCell>
              <TableCell>{listing.postCode}</TableCell>
              <TableCell>
                <Chip
                  label={listing.status}
                  color={STATUS_COLORS[listing.status] ?? 'default'}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
