import { IDemoRequestDto, IDemoResponseDto } from '@repo/book-skye-api-client';
import { IsString, MaxLength } from 'class-validator';

export class DemoRequestDto implements IDemoRequestDto {
  @IsString()
  @MaxLength(50)
  name: string;
}

export class DemoResponseDto implements IDemoResponseDto {
  arbitaryProp: string;
}
