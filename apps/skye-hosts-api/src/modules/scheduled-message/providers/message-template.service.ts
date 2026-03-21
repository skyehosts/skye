import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import type {
  IGetMessageTemplatesResponseDto,
  IMessageTemplateDto,
} from '@repo/skye-hosts-api-client';
import { DataSource, IsNull, Repository } from 'typeorm';
import {
  CreateMessageTemplateRequestDto,
  UpdateMessageTemplateRequestDto,
} from '../dto';
import {
  ListingMessageTemplate,
  MessageTemplate,
  TemplateTrigger,
  TemplateVersion,
} from '../entities';
import { TemplateInterpolationService } from './template-interpolation.service';

@Injectable()
export class MessageTemplateService {
  constructor(
    @InjectRepository(MessageTemplate)
    private readonly messageTemplateRepo: Repository<MessageTemplate>,
    @InjectRepository(TemplateVersion)
    private readonly templateVersionRepo: Repository<TemplateVersion>,
    @InjectRepository(ListingMessageTemplate)
    private readonly listingMessageTemplateRepo: Repository<ListingMessageTemplate>,
    @InjectRepository(TemplateTrigger)
    private readonly templateTriggerRepo: Repository<TemplateTrigger>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly templateInterpolationService: TemplateInterpolationService,
  ) {}

  async create(
    hostId: number,
    dto: CreateMessageTemplateRequestDto,
  ): Promise<IMessageTemplateDto> {
    this.validateContent(dto.content);
    return this.dataSource.transaction(async (manager) => {
      const now = new Date();

      const template = await manager.getRepository(MessageTemplate).save({
        hostId,
        name: dto.name,
        channel: dto.channel,
        isActive: true,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
      } as MessageTemplate);

      const version = await manager.getRepository(TemplateVersion).save({
        messageTemplateId: template.id,
        versionNumber: 1,
        content: dto.content,
        status: 'active',
        createdAt: now,
        isActive: true,
      } as TemplateVersion);

      const listingLinks = await Promise.all(
        dto.listingIds.map((listingId) =>
          manager.getRepository(ListingMessageTemplate).save({
            listingId,
            messageTemplateId: template.id,
            attachedAt: now,
          } as ListingMessageTemplate),
        ),
      );

      const triggers = await Promise.all(
        dto.triggers.map((t) =>
          manager.getRepository(TemplateTrigger).save({
            messageTemplateId: template.id,
            triggerType: t.triggerType,
            offsetValue: t.offsetValue,
            offsetUnit: t.offsetUnit,
            allowMultiplePerBooking: t.allowMultiplePerBooking,
            sendIfPast: t.sendIfPast,
            createdAt: now,
          } as TemplateTrigger),
        ),
      );

      return this.toDto(template, version, listingLinks, triggers);
    });
  }

  async update(
    id: number,
    hostId: number,
    dto: UpdateMessageTemplateRequestDto,
  ): Promise<IMessageTemplateDto> {
    this.validateContent(dto.content);
    return this.dataSource.transaction(async (manager) => {
      const template = await manager
        .getRepository(MessageTemplate)
        .findOne({ where: { id, hostId, deletedAt: IsNull() } });

      if (!template) {
        throw new NotFoundException('Message template not found');
      }

      const now = new Date();

      template.name = dto.name;
      template.channel = dto.channel;
      template.updatedAt = now;

      await manager.getRepository(MessageTemplate).save(template);

      // Find current active version — create a new one if content changed
      const activeVersion = await manager
        .getRepository(TemplateVersion)
        .findOne({
          where: { messageTemplateId: id, status: 'active' },
          order: { versionNumber: 'DESC' },
        });

      let currentVersion: TemplateVersion;

      if (!activeVersion || activeVersion.content !== dto.content) {
        if (activeVersion) {
          activeVersion.status = 'archived';
          await manager.getRepository(TemplateVersion).save(activeVersion);
        }

        const nextVersionNumber = activeVersion
          ? activeVersion.versionNumber + 1
          : 1;

        currentVersion = await manager.getRepository(TemplateVersion).save({
          messageTemplateId: id,
          versionNumber: nextVersionNumber,
          content: dto.content,
          status: 'active',
          createdAt: now,
          isActive: true,
        } as TemplateVersion);
      } else {
        currentVersion = activeVersion;
      }

      // Replace listings
      await manager
        .getRepository(ListingMessageTemplate)
        .delete({ messageTemplateId: id });

      const listingLinks = await Promise.all(
        dto.listingIds.map((listingId) =>
          manager.getRepository(ListingMessageTemplate).save({
            listingId,
            messageTemplateId: id,
            attachedAt: now,
          } as ListingMessageTemplate),
        ),
      );

      // Replace triggers
      await manager
        .getRepository(TemplateTrigger)
        .delete({ messageTemplateId: id });

      const triggers = await Promise.all(
        dto.triggers.map((t) =>
          manager.getRepository(TemplateTrigger).save({
            messageTemplateId: id,
            triggerType: t.triggerType,
            offsetValue: t.offsetValue,
            offsetUnit: t.offsetUnit,
            allowMultiplePerBooking: t.allowMultiplePerBooking,
            sendIfPast: t.sendIfPast,
            createdAt: now,
          } as TemplateTrigger),
        ),
      );

      return this.toDto(template, currentVersion, listingLinks, triggers);
    });
  }

  async delete(id: number, hostId: number): Promise<void> {
    const template = await this.messageTemplateRepo.findOne({
      where: { id, hostId, deletedAt: IsNull() },
    });

    if (!template) {
      throw new NotFoundException('Message template not found');
    }

    template.deletedAt = new Date();
    await this.messageTemplateRepo.save(template);
  }

  async getAll(hostId: number): Promise<IGetMessageTemplatesResponseDto> {
    const templates = await this.messageTemplateRepo.find({
      where: { hostId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    const dtos = await Promise.all(
      templates.map((t) => this.loadAndBuildDto(t)),
    );

    return { templates: dtos };
  }

  async getById(id: number, hostId: number): Promise<IMessageTemplateDto> {
    const template = await this.messageTemplateRepo.findOne({
      where: { id, hostId, deletedAt: IsNull() },
    });

    if (!template) {
      throw new NotFoundException('Message template not found');
    }

    return this.loadAndBuildDto(template);
  }

  private async loadAndBuildDto(
    template: MessageTemplate,
  ): Promise<IMessageTemplateDto> {
    const [activeVersion, listingLinks, triggers] = await Promise.all([
      this.templateVersionRepo.findOne({
        where: { messageTemplateId: template.id, status: 'active' },
        order: { versionNumber: 'DESC' },
      }),
      this.listingMessageTemplateRepo.find({
        where: { messageTemplateId: template.id },
      }),
      this.templateTriggerRepo.find({
        where: { messageTemplateId: template.id },
      }),
    ]);

    return this.toDto(template, activeVersion ?? null, listingLinks, triggers);
  }

  private validateContent(content: string): void {
    const invalidTokens =
      this.templateInterpolationService.validateTokens(content);
    if (invalidTokens.length > 0) {
      throw new BadRequestException(
        `Unknown template tokens: ${invalidTokens.join(', ')}. Check spelling or remove unrecognised {{...}} tags.`,
      );
    }
  }

  private toDto(
    template: MessageTemplate,
    activeVersion: TemplateVersion | null,
    listingLinks: ListingMessageTemplate[],
    triggers: TemplateTrigger[],
  ): IMessageTemplateDto {
    return {
      id: template.id,
      name: template.name,
      channel: template.channel,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      activeVersion: activeVersion
        ? {
            id: activeVersion.id,
            versionNumber: activeVersion.versionNumber,
            content: activeVersion.content,
            status: activeVersion.status,
            createdAt: activeVersion.createdAt,
          }
        : null,
      listingIds: listingLinks.map((l) => l.listingId),
      triggers: triggers.map((t) => ({
        id: t.id,
        triggerType: t.triggerType,
        offsetValue: t.offsetValue,
        offsetUnit: t.offsetUnit,
        allowMultiplePerBooking: t.allowMultiplePerBooking,
        sendIfPast: t.sendIfPast,
      })),
    };
  }
}
