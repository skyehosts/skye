import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import type {
  ICalendarPricesResponseDto,
  IGetOverridesResponseDto,
  IQuoteResponseDto,
} from '@repo/common';
import {
  AuthenticatedUser,
  IgnoreBearerAuthentication,
} from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  DeleteOverridesRequestDto,
  QuoteRequestDto,
  UpsertOverridesRequestDto,
} from '../dto';
import { ListingPricingService } from '../providers';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function assertDateString(value: string, field: string): void {
  if (!DATE_RE.test(value)) {
    throw new BadRequestException(`${field} must be YYYY-MM-DD`);
  }
}

@Controller('listing')
export class ListingQuoteController {
  constructor(private readonly pricingService: ListingPricingService) {}

  @Post(':id/quote')
  @IgnoreBearerAuthentication()
  async onQuote(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: QuoteRequestDto,
  ): Promise<IQuoteResponseDto> {
    return this.pricingService.computeQuote(id, body);
  }

  @Get(':id/calendar-prices')
  async onGetCalendarPrices(
    @Param('id', ParseIntPipe) id: number,
    @Query('from') from: string,
    @Query('to') to: string,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<ICalendarPricesResponseDto> {
    assertDateString(from, 'from');
    assertDateString(to, 'to');
    return this.pricingService.getCalendarPrices(
      id,
      authenticatedUser.sub,
      from,
      to,
    );
  }

  @Get(':id/overrides')
  async onGetOverrides(
    @Param('id', ParseIntPipe) id: number,
    @Query('from') from: string,
    @Query('to') to: string,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<IGetOverridesResponseDto> {
    assertDateString(from, 'from');
    assertDateString(to, 'to');
    return this.pricingService.getOverridesInRange(
      id,
      authenticatedUser.sub,
      from,
      to,
    );
  }

  @Put(':id/overrides')
  @HttpCode(HttpStatus.NO_CONTENT)
  async onUpsertOverrides(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpsertOverridesRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    await this.pricingService.upsertOverridesForDates(
      id,
      authenticatedUser.sub,
      body,
    );
  }

  @Delete(':id/overrides')
  @HttpCode(HttpStatus.NO_CONTENT)
  async onDeleteOverrides(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: DeleteOverridesRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    await this.pricingService.deleteOverridesForDates(
      id,
      authenticatedUser.sub,
      body,
    );
  }
}
