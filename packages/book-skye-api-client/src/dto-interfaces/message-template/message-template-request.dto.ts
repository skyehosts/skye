import type {
  MessageChannel,
  OffsetUnit,
  TriggerType,
} from '../../enums/message-template-enums';

export interface ITemplateTriggerInputDto {
  triggerType: TriggerType;
  offsetValue: number;
  offsetUnit: OffsetUnit;
  allowMultiplePerBooking: boolean;
  sendIfPast: boolean;
}

export interface ICreateMessageTemplateRequestDto {
  name: string;
  channel: MessageChannel;
  content: string;
  listingIds: number[];
  triggers: ITemplateTriggerInputDto[];
}

export interface IUpdateMessageTemplateRequestDto {
  name: string;
  channel: MessageChannel;
  content: string;
  listingIds: number[];
  triggers: ITemplateTriggerInputDto[];
}
