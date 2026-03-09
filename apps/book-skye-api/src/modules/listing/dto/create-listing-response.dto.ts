import type { ICreateListingResponseDto } from '@repo/book-skye-api-client';

export class CreateListingResponseDto implements ICreateListingResponseDto {
  id: number;
  createdAt: Date;
}
