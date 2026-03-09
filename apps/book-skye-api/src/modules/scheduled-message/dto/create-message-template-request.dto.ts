import type { MessageChannel } from '@repo/skye-hosts-api-client';
import {
  ICreateMessageTemplateRequestDto,
  MESSAGE_CHANNELS,
} from '@repo/skye-hosts-api-client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TemplateTriggerInputDto } from './template-trigger-input.dto';

export class CreateMessageTemplateRequestDto implements ICreateMessageTemplateRequestDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsIn(MESSAGE_CHANNELS)
  channel: MessageChannel;

  @IsString()
  content: string;

  @IsArray()
  @IsNumber({}, { each: true })
  listingIds: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateTriggerInputDto)
  triggers: TemplateTriggerInputDto[];
}
