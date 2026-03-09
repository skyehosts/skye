import { IsString, MaxLength } from 'class-validator';
import {
  IDemoRequestDto,
  IDemoResponseDto,
} from '../../../../../../packages/skye-hosts-api-client/src';

export class DemoRequestDto implements IDemoRequestDto {
  @IsString()
  @MaxLength(50)
  name: string;
}

export class DemoResponseDto implements IDemoResponseDto {
  arbitaryProp: string;
}
