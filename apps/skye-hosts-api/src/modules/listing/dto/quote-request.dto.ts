import type { IQuoteRequestDto } from '@repo/common';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsObject,
  Min,
  ValidateNested,
} from 'class-validator';

class QuoteGuestCountDto {
  @IsInt()
  @Min(0)
  adults: number;

  @IsInt()
  @Min(0)
  children: number;

  @IsInt()
  @Min(0)
  babies: number;
}

export class QuoteRequestDto implements IQuoteRequestDto {
  @IsDateString({ strict: true })
  checkInDate: string;

  @IsDateString({ strict: true })
  checkOutDate: string;

  @IsObject()
  @ValidateNested()
  @Type(() => QuoteGuestCountDto)
  guestCount: QuoteGuestCountDto;
}
