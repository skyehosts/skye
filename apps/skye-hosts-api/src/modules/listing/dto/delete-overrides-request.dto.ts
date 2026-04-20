import type { IDeleteOverridesRequestDto } from '@repo/common';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDateString,
} from 'class-validator';

export class DeleteOverridesRequestDto implements IDeleteOverridesRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsDateString({ strict: true }, { each: true })
  dates: string[];
}
