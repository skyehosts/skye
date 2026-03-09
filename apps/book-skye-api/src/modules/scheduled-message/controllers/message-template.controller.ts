import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import type {
  IGetMessageTemplatesResponseDto,
  IMessageTemplateDto,
} from '@repo/skye-hosts-api-client';
import { AuthenticatedUser } from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  CreateMessageTemplateRequestDto,
  UpdateMessageTemplateRequestDto,
} from '../dto';
import { MessageTemplateService } from '../providers/message-template.service';

@Controller('message-template')
export class MessageTemplateController {
  constructor(private readonly service: MessageTemplateService) {}

  @Post()
  async onCreate(
    @Body() body: CreateMessageTemplateRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<IMessageTemplateDto> {
    return this.service.create(authenticatedUser.sub, body);
  }

  @Put(':id')
  async onUpdate(
    @Param('id') id: string,
    @Body() body: UpdateMessageTemplateRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<IMessageTemplateDto> {
    return this.service.update(Number(id), authenticatedUser.sub, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async onDelete(
    @Param('id') id: string,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    return this.service.delete(Number(id), authenticatedUser.sub);
  }

  @Get()
  async onGetAll(
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<IGetMessageTemplatesResponseDto> {
    return this.service.getAll(authenticatedUser.sub);
  }

  @Get(':id')
  async onGetById(
    @Param('id') id: string,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<IMessageTemplateDto> {
    return this.service.getById(Number(id), authenticatedUser.sub);
  }
}
