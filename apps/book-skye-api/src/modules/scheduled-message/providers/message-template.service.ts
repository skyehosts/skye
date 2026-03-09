import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  IGetMessageTemplatesResponseDto,
  IMessageTemplateDto,
} from '@repo/skye-hosts-api-client';
import { IsNull } from 'typeorm';
import { DatabaseService } from '../../common/providers';
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

@Injectable()
export class MessageTemplateService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    hostId: number,
    dto: CreateMessageTemplateRequestDto,
  ): Promise<IMessageTemplateDto> {
    const queryRunner = await this.databaseService.startTransaction();

    try {
      const now = new Date();

      const template = await this.databaseService
        .getRepository(MessageTemplate)
        .save({
          hostId,
          name: dto.name,
          channel: dto.channel,
          isActive: true,
          deletedAt: null,
          createdAt: now,
          updatedAt: now,
        } as MessageTemplate);

      const version = await this.databaseService
        .getRepository(TemplateVersion)
        .save({
          messageTemplateId: template.id,
          versionNumber: 1,
          content: dto.content,
          status: 'active',
          createdAt: now,
          isActive: true,
        } as TemplateVersion);

      const listingLinks = await Promise.all(
        dto.listingIds.map((listingId) =>
          this.databaseService.getRepository(ListingMessageTemplate).save({
            listingId,
            messageTemplateId: template.id,
            attachedAt: now,
          } as ListingMessageTemplate),
        ),
      );

      const triggers = await Promise.all(
        dto.triggers.map((t) =>
          this.databaseService.getRepository(TemplateTrigger).save({
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

      await queryRunner.commitTransaction();

      return this.toDto(template, version, listingLinks, triggers);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await this.databaseService.releaseTransaction();
    }
  }

  async update(
    id: number,
    hostId: number,
    dto: UpdateMessageTemplateRequestDto,
  ): Promise<IMessageTemplateDto> {
    const queryRunner = await this.databaseService.startTransaction();

    try {
      const template = await this.databaseService
        .getRepository(MessageTemplate)
        .findOne({ where: { id, hostId, deletedAt: IsNull() } });

      if (!template) {
        throw new NotFoundException('Message template not found');
      }

      const now = new Date();

      template.name = dto.name;
      template.channel = dto.channel;
      template.updatedAt = now;

      await this.databaseService.getRepository(MessageTemplate).save(template);

      // Find current active version — create a new one if content changed
      const activeVersion = await this.databaseService
        .getRepository(TemplateVersion)
        .findOne({
          where: { messageTemplateId: id, status: 'active' },
          order: { versionNumber: 'DESC' },
        });

      let currentVersion: TemplateVersion;

      if (!activeVersion || activeVersion.content !== dto.content) {
        if (activeVersion) {
          activeVersion.status = 'archived';
          await this.databaseService
            .getRepository(TemplateVersion)
            .save(activeVersion);
        }

        const nextVersionNumber = activeVersion
          ? activeVersion.versionNumber + 1
          : 1;

        currentVersion = await this.databaseService
          .getRepository(TemplateVersion)
          .save({
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
      await this.databaseService
        .getRepository(ListingMessageTemplate)
        .delete({ messageTemplateId: id });

      const listingLinks = await Promise.all(
        dto.listingIds.map((listingId) =>
          this.databaseService.getRepository(ListingMessageTemplate).save({
            listingId,
            messageTemplateId: id,
            attachedAt: now,
          } as ListingMessageTemplate),
        ),
      );

      // Replace triggers
      await this.databaseService
        .getRepository(TemplateTrigger)
        .delete({ messageTemplateId: id });

      const triggers = await Promise.all(
        dto.triggers.map((t) =>
          this.databaseService.getRepository(TemplateTrigger).save({
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

      await queryRunner.commitTransaction();

      return this.toDto(template, currentVersion, listingLinks, triggers);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await this.databaseService.releaseTransaction();
    }
  }

  async delete(id: number, hostId: number): Promise<void> {
    const template = await this.databaseService
      .getRepository(MessageTemplate)
      .findOne({ where: { id, hostId, deletedAt: IsNull() } });

    if (!template) {
      throw new NotFoundException('Message template not found');
    }

    template.deletedAt = new Date();
    await this.databaseService.getRepository(MessageTemplate).save(template);
  }

  async getAll(hostId: number): Promise<IGetMessageTemplatesResponseDto> {
    const templates = await this.databaseService
      .getRepository(MessageTemplate)
      .find({
        where: { hostId, deletedAt: IsNull() },
        order: { createdAt: 'DESC' },
      });

    const dtos = await Promise.all(
      templates.map((t) => this.loadAndBuildDto(t)),
    );

    return { templates: dtos };
  }

  async getById(id: number, hostId: number): Promise<IMessageTemplateDto> {
    const template = await this.databaseService
      .getRepository(MessageTemplate)
      .findOne({ where: { id, hostId, deletedAt: IsNull() } });

    if (!template) {
      throw new NotFoundException('Message template not found');
    }

    return this.loadAndBuildDto(template);
  }

  private async loadAndBuildDto(
    template: MessageTemplate,
  ): Promise<IMessageTemplateDto> {
    const [activeVersion, listingLinks, triggers] = await Promise.all([
      this.databaseService.getRepository(TemplateVersion).findOne({
        where: { messageTemplateId: template.id, status: 'active' },
        order: { versionNumber: 'DESC' },
      }),
      this.databaseService
        .getRepository(ListingMessageTemplate)
        .find({ where: { messageTemplateId: template.id } }),
      this.databaseService
        .getRepository(TemplateTrigger)
        .find({ where: { messageTemplateId: template.id } }),
    ]);

    return this.toDto(template, activeVersion ?? null, listingLinks, triggers);
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
