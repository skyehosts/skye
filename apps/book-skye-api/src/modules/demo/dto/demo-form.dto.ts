import type {
  DemoFormPriority,
  IDemoFormRequestDto,
  IDemoFormResponseDto,
} from '@repo/skye-hosts-api-client';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class DemoFormRequestDto implements IDemoFormRequestDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(1000)
  message: string;

  @IsIn(['general', 'support', 'feedback'])
  category: 'general' | 'support' | 'feedback';

  @IsBoolean()
  subscribe: boolean;

  @IsNumber()
  @Min(18)
  @Max(120)
  age: number;

  @IsIn(['low', 'medium', 'high'])
  priority: DemoFormPriority;

  @IsOptional()
  @IsUrl()
  website?: string;
}

export class DemoFormResponseDto implements IDemoFormResponseDto {
  id: string;
  submittedAt: string;
}
