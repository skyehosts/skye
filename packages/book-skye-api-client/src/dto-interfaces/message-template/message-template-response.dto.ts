import type {
  MessageChannel,
  OffsetUnit,
  TemplateVersionStatus,
  TriggerType,
} from '../../enums/message-template-enums';

export interface IMessageTemplateVersionDto {
  id: number;
  versionNumber: number;
  content: string;
  status: TemplateVersionStatus;
  createdAt: Date;
}

export interface IMessageTemplateTriggerDto {
  id: number;
  triggerType: TriggerType;
  offsetValue: number;
  offsetUnit: OffsetUnit;
  allowMultiplePerBooking: boolean;
  sendIfPast: boolean;
}

export interface IMessageTemplateDto {
  id: number;
  name: string;
  channel: MessageChannel;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  activeVersion: IMessageTemplateVersionDto | null;
  listingIds: number[];
  triggers: IMessageTemplateTriggerDto[];
}

export interface IGetMessageTemplatesResponseDto {
  templates: IMessageTemplateDto[];
}
