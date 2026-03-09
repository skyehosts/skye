import type { ICreateListingResponseDto } from '../../../../../../packages/skye-hosts-api-client/src';

export class CreateListingResponseDto implements ICreateListingResponseDto {
  id: number;
  createdAt: Date;
}
