import type { IUpdateDiscountsRequestDto } from '@repo/common';
import { IsBoolean, IsInt, Max, Min } from 'class-validator';

export class UpdateDiscountsRequestDto implements IUpdateDiscountsRequestDto {
  @IsBoolean()
  lastMinuteEnabled: boolean;

  @IsInt()
  @Min(0)
  @Max(100)
  lastMinutePercent: number;

  @IsBoolean()
  weeklyEnabled: boolean;

  @IsInt()
  @Min(0)
  @Max(100)
  weeklyPercent: number;

  @IsBoolean()
  monthlyEnabled: boolean;

  @IsInt()
  @Min(0)
  @Max(100)
  monthlyPercent: number;
}
