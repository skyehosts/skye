import { IDemoRequestDto, IDemoResponseDto } from '@repo/skye-hosts-api-client';
import { IsString, MaxLength } from 'class-validator';

export class DemoRequestDto implements IDemoRequestDto {
  @IsString()
  @MaxLength(50)
  name: string;
}

export class DemoResponseDto implements IDemoResponseDto {
  arbitaryProp: string;
}
