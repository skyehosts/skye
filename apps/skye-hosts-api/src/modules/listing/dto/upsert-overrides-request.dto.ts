import type { IUpsertOverridesRequestDto } from '@repo/common';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';

export class UpsertOverridesRequestDto implements IUpsertOverridesRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsDateString({ strict: true }, { each: true })
  dates: string[];

  @IsInt()
  @Min(0)
  pricePence: number;
}
