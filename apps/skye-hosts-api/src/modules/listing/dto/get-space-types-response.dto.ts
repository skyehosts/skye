import type {
  IGetSpaceTypesResponseDto,
  IListingSpaceTypeDto,
} from '@repo/skye-hosts-api-client';
import { ListingSpaceType } from '@repo/skye-hosts-api-client';

export class ListingSpaceTypeDto implements IListingSpaceTypeDto {
  id: ListingSpaceType;
  title: string;
  description: string;
}

export class GetSpaceTypesResponseDto implements IGetSpaceTypesResponseDto {
  types: ListingSpaceTypeDto[];
}

export const SPACE_TYPES: ListingSpaceTypeDto[] = [
  {
    id: ListingSpaceType.EntirePlace,
    title: 'An entire place',
    description: 'Guests have the whole place to themselves.',
  },
  {
    id: ListingSpaceType.Room,
    title: 'A room',
    description:
      'Guests have their own room in a home, plus access to shared spaces.',
  },
  {
    id: ListingSpaceType.SharedRoom,
    title: 'A shared room in a hostel',
    description:
      'Guests sleep in a shared room in a professionally managed hostel with staff on-site 24/7.',
  },
];
