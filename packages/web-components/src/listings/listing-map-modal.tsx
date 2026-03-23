'use client';

import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useEffect, useRef } from 'react';

export interface ListingMapModalProps {
  open: boolean;
  onClose: () => void;
  approximateLatitude: number;
  approximateLongitude: number;
  mapboxAccessToken: string;
  listingTitle: string;
}

export function ListingMapModal({
  open,
  onClose,
  approximateLatitude,
  approximateLongitude,
  mapboxAccessToken,
  listingTitle,
}: ListingMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !mapContainerRef.current) return;

    let map: mapboxgl.Map | null = null;

    const initMap = async () => {
      const mapboxgl = (await import('mapbox-gl')).default;

      // Inject Mapbox CSS if not already present
      if (!document.getElementById('mapbox-gl-css')) {
        const link = document.createElement('link');
        link.id = 'mapbox-gl-css';
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css';
        document.head.appendChild(link);
      }

      if (!mapContainerRef.current) return;

      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        accessToken: mapboxAccessToken,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [approximateLongitude, approximateLatitude],
        zoom: 11,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.on('load', () => {
        if (!map) return;

        map.addSource('approximate-area', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [approximateLongitude, approximateLatitude],
            },
            properties: {},
          },
        });

        map.addLayer({
          id: 'approximate-area-circle',
          type: 'circle',
          source: 'approximate-area',
          paint: {
            'circle-radius': {
              stops: [
                [10, 20],
                [14, 80],
                [18, 320],
              ],
            },
            'circle-color': 'rgba(66, 133, 244, 0.15)',
            'circle-stroke-color': 'rgba(66, 133, 244, 0.5)',
            'circle-stroke-width': 2,
          },
        });
      });
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [open, approximateLatitude, approximateLongitude, mapboxAccessToken]);

  const directionsUrl = `https://www.google.com/maps?q=${approximateLatitude},${approximateLongitude}`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" keepMounted>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" component="span">
          Approximate location of {listingTitle}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <Box
          ref={mapContainerRef}
          sx={{ width: '100%', height: { xs: 400, md: 560 } }}
        />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
