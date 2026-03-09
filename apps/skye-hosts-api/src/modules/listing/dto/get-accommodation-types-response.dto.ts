import type {
  IGetAccommodationTypesResponseDto,
  IListingTypeDto,
} from '@repo/skye-hosts-api-client';
import { ListingTypeId } from '@repo/skye-hosts-api-client';

export class ListingTypeDto implements IListingTypeDto {
  id: ListingTypeId;
  title: string;
}

export class GetAccommodationTypesResponseDto implements IGetAccommodationTypesResponseDto {
  types: ListingTypeDto[];
}

export const ACCOMMODATION_TYPES: ListingTypeDto[] = [
  { id: ListingTypeId.House, title: 'House' },
  { id: ListingTypeId.FlatApartment, title: 'Flat / Apartment' },
  { id: ListingTypeId.Barn, title: 'Barn' },
  { id: ListingTypeId.BedAndBreakfast, title: 'Bed & Breakfast' },
  { id: ListingTypeId.Cabin, title: 'Cabin' },
  { id: ListingTypeId.CampervanMotorhome, title: 'Campervan / Motorhome' },
  { id: ListingTypeId.Farm, title: 'Farm' },
  { id: ListingTypeId.GuestHouse, title: 'Guest House' },
  { id: ListingTypeId.Hotel, title: 'Hotel' },
  { id: ListingTypeId.Houseboat, title: 'Houseboat' },
  { id: ListingTypeId.ShepherdsHut, title: "Shepherd's Hut" },
  { id: ListingTypeId.Tent, title: 'Tent' },
  { id: ListingTypeId.TinyHome, title: 'Tiny Home' },
  { id: ListingTypeId.TreeHouse, title: 'Tree House' },
  { id: ListingTypeId.Yurt, title: 'Yurt' },
];
