import type { IUpdateCleaningFeeRequestDto } from '@repo/common';
import { MAX_CLEANING_FEE_POUND } from '@repo/common';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateCleaningFeeRequestDto implements IUpdateCleaningFeeRequestDto {
  @IsInt()
  @Min(0)
  @Max(MAX_CLEANING_FEE_POUND)
  cleaningFeePound: number;
}
