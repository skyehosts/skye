import type { IUpdateSeasonPricingRequestDto } from '@repo/common';
import { IsInt, Min } from 'class-validator';

export class UpdateSeasonPricingRequestDto implements IUpdateSeasonPricingRequestDto {
  @IsInt()
  @Min(0)
  weekdayPricePence: number;

  @IsInt()
  @Min(0)
  weekendPricePence: number;
}
