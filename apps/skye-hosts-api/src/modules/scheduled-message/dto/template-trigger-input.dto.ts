import { IsBoolean, IsIn, IsNumber, Min } from 'class-validator';
import type {
  OffsetUnit,
  TriggerType,
} from '../../../../../../packages/skye-hosts-api-client/src';
import {
  ITemplateTriggerInputDto,
  OFFSET_UNITS,
  TRIGGER_TYPES,
} from '../../../../../../packages/skye-hosts-api-client/src';

export class TemplateTriggerInputDto implements ITemplateTriggerInputDto {
  @IsIn(TRIGGER_TYPES)
  triggerType: TriggerType;

  @IsNumber()
  @Min(0)
  offsetValue: number;

  @IsIn(OFFSET_UNITS)
  offsetUnit: OffsetUnit;

  @IsBoolean()
  allowMultiplePerBooking: boolean;

  @IsBoolean()
  sendIfPast: boolean;
}
