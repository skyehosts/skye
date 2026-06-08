'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { differenceInCalendarDays, format, isValid, parse } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { ListingDatePickerPopup } from './listing-date-picker-popup';
import { GuestCounterRows } from './listing-guest-counter-rows';
import { ListingGuestSelectorModal } from './listing-guest-selector-modal';
import type {
  ListingBookingStateProps,
  ListingGuestRuleProps,
  ListingNightRuleProps,
} from './listing-guest-types';
import {
  buildGuestInfoText,
  buildGuestRows,
  formatGuestSummary,
  getMinNightsForDate,
} from './listing-guest-types';

const DATE_FORMAT = 'dd/MM/yyyy';

function formatDateField(date: Date | null | undefined): string {
  if (!date) return '';
  return format(date, DATE_FORMAT);
}

function parseDateField(text: string): Date | null {
  if (!text.trim()) return null;
  const parsed = parse(text.trim(), DATE_FORMAT, new Date());
  if (!isValid(parsed)) return null;
  if (parsed.getFullYear() < 2020 || parsed.getFullYear() > 2100) return null;
  return parsed;
}

const dateInputBaseSx = {
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: '0.875rem',
  color: 'inherit',
  width: '100%',
  padding: 0,
  cursor: 'text',
} as const;

interface ListingBookingSidebarProps
  extends
    ListingGuestRuleProps,
    ListingNightRuleProps,
    ListingBookingStateProps {
  unavailableDates?: Set<string>;
  onReserveClick: () => void;
}

export function ListingBookingSidebar({
  maxGuests,
  childrenAllowed,
  infantsAllowed,
  petsAllowed,
  minNights,
  minNightsByCheckInDay,
  maxNights,
  unavailableDates,
  dateRange,
  guests,
  dateModalOpen,
  setDateModalOpen,
  guestModalOpen,
  setGuestModalOpen,
  handleDateSave,
  handleDateClear,
  handleGuestSave,
  handleGuestChange,
  onReserveClick,
}: ListingBookingSidebarProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
  const guestRows = buildGuestRows(
    maxGuests,
    childrenAllowed,
    infantsAllowed,
    petsAllowed,
  );
  const dateInputSx = {
    ...dateInputBaseSx,
    fontFamily: theme.typography.fontFamily,
  } as const;

  const captionSx = {
    fontWeight: 700,
    textTransform: 'uppercase',
    fontSize: '0.65rem',
  } as const;

  const [checkInText, setCheckInText] = useState(
    formatDateField(dateRange?.from),
  );
  const [checkOutText, setCheckOutText] = useState(
    formatDateField(dateRange?.to),
  );
  const checkOutRef = useRef<HTMLInputElement>(null);

  // Track parsed dates for syncing to popup
  const [externalFrom, setExternalFrom] = useState<Date | null>(
    dateRange?.from ?? null,
  );
  const [externalTo, setExternalTo] = useState<Date | null>(
    dateRange?.to ?? null,
  );

  // Sync input text when dateRange changes externally (e.g. from calendar pick)
  useEffect(() => {
    setCheckInText(formatDateField(dateRange?.from));
    setCheckOutText(formatDateField(dateRange?.to));
    setExternalFrom(dateRange?.from ?? null);
    setExternalTo(dateRange?.to ?? null);
  }, [dateRange]);

  function handleCheckInBlur() {
    const parsed = parseDateField(checkInText);
    if (parsed && parsed >= new Date(new Date().toDateString())) {
      setExternalFrom(parsed);
      // If check-out is before new check-in, clear it
      if (externalTo && parsed >= externalTo) {
        setExternalTo(null);
        setCheckOutText('');
      }
    } else {
      // Revert to previous valid value
      setCheckInText(formatDateField(dateRange?.from));
    }
  }

  function handleCheckOutBlur() {
    const parsed = parseDateField(checkOutText);
    if (parsed && externalFrom && parsed > externalFrom) {
      const nights = differenceInCalendarDays(parsed, externalFrom);
      const effectiveMin = getMinNightsForDate(
        externalFrom,
        minNights,
        minNightsByCheckInDay,
      );
      if (nights < effectiveMin || (maxNights !== null && nights > maxNights)) {
        setCheckOutText(formatDateField(dateRange?.to));
        return;
      }
      setExternalTo(parsed);
    } else {
      // Revert to previous valid value
      setCheckOutText(formatDateField(dateRange?.to));
    }
  }

  function handleCheckInKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
      checkOutRef.current?.focus();
      checkOutRef.current?.select();
    }
  }

  function handleInputFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.select();
    if (!dateModalOpen) setDateModalOpen(true);
  }

  return (
    <>
      <Box sx={{ position: 'sticky', top: 24, mt: 3.75 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 3, overflow: 'visible' }}>
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                £120
              </Typography>
              <Typography variant="body2" color="text.secondary">
                night
              </Typography>
            </Box>

            {/* Date selector row + popup wrapper */}
            <Box sx={{ position: 'relative' }}>
              <Box
                onClick={() => setDateModalOpen(true)}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  mb: 1.5,
                  position: 'relative',
                  bgcolor: 'background.paper',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    position: 'relative',
                    zIndex: dateModalOpen ? 1301 : 'auto',
                    bgcolor: 'background.paper',
                    ...(dateModalOpen && {
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                    }),
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRight: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" sx={captionSx}>
                      Check-in
                    </Typography>
                    <input
                      type="text"
                      value={checkInText}
                      placeholder="dd/mm/yyyy"
                      onChange={(e) => setCheckInText(e.target.value)}
                      onBlur={handleCheckInBlur}
                      onFocus={handleInputFocus}
                      onKeyDown={handleCheckInKeyDown}
                      onClick={(e) => e.stopPropagation()}
                      style={dateInputSx}
                    />
                  </Box>
                  <Box sx={{ flex: 1, p: 1.5 }}>
                    <Typography variant="caption" sx={captionSx}>
                      Checkout
                    </Typography>
                    <input
                      ref={checkOutRef}
                      type="text"
                      value={checkOutText}
                      placeholder="dd/mm/yyyy"
                      onChange={(e) => setCheckOutText(e.target.value)}
                      onBlur={handleCheckOutBlur}
                      onFocus={handleInputFocus}
                      onClick={(e) => e.stopPropagation()}
                      style={dateInputSx}
                    />
                  </Box>
                </Box>

                {/* Guest selector row — hidden when date popup is open */}
                <Box
                  sx={{
                    ...(dateModalOpen && { visibility: 'hidden' }),
                  }}
                >
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      setGuestModalOpen(!guestModalOpen);
                    }}
                    sx={{
                      p: 1.5,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                    }}
                  >
                    <Typography variant="caption" sx={captionSx}>
                      Guests
                    </Typography>
                    <Typography variant="body2">
                      {formatGuestSummary(guests)}
                    </Typography>
                  </Box>

                  <Collapse in={isDesktop && guestModalOpen}>
                    <Box
                      onClick={(e) => e.stopPropagation()}
                      sx={{ px: 1.5, pb: 1.5 }}
                    >
                      <GuestCounterRows
                        counts={guests}
                        rows={guestRows}
                        onChangeKey={(key, delta) => {
                          handleGuestChange({
                            ...guests,
                            [key]: guests[key] + delta,
                          });
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 1 }}
                      >
                        {buildGuestInfoText(
                          maxGuests,
                          petsAllowed,
                          childrenAllowed,
                          infantsAllowed,
                        )}
                      </Typography>
                    </Box>
                  </Collapse>
                </Box>
              </Box>

              {/* Desktop date picker popup */}
              <ListingDatePickerPopup
                open={dateModalOpen}
                onClose={() => setDateModalOpen(false)}
                onSave={handleDateSave}
                onClear={handleDateClear}
                initialRange={dateRange}
                externalFrom={externalFrom}
                externalTo={externalTo}
                unavailableDates={unavailableDates}
                minNights={minNights}
                minNightsByCheckInDay={minNightsByCheckInDay}
                maxNights={maxNights}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => {
                if (!dateRange) {
                  setDateModalOpen(true);
                } else {
                  onReserveClick();
                }
              }}
              sx={{ mb: 1.5 }}
            >
              {dateRange ? 'Reserve' : 'Check availability'}
            </Button>
          </CardContent>
        </Card>
      </Box>

      <ListingGuestSelectorModal
        open={!isDesktop && guestModalOpen}
        onClose={() => setGuestModalOpen(false)}
        onSave={handleGuestSave}
        initialGuests={guests}
        maxGuests={maxGuests}
        childrenAllowed={childrenAllowed}
        infantsAllowed={infantsAllowed}
        petsAllowed={petsAllowed}
      />
    </>
  );
}
