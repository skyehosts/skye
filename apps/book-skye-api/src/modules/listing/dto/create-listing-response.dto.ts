import type { ICreateListingResponseDto } from '@repo/skye-hosts-api-client';

export class CreateListingResponseDto implements ICreateListingResponseDto {
  id: number;
  createdAt: Date;
}
