import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import type {
  IGetListingPricingResponseDto,
  PricingSeasonId,
} from '@repo/common';
import { AuthenticatedUser } from '../../common/decorators';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  UpdateCleaningFeeRequestDto,
  UpdateDiscountsRequestDto,
  UpdateSeasonPricingRequestDto,
} from '../dto';
import { ListingPricingService } from '../providers';

@Controller('listing')
export class ListingPricingController {
  constructor(private readonly pricingService: ListingPricingService) {}

  @Get(':id/pricing')
  async onGetPricing(
    @Param('id', ParseIntPipe) id: number,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<IGetListingPricingResponseDto> {
    return this.pricingService.getPricingConfig(id, authenticatedUser.sub);
  }

  @Put(':id/pricing/seasons/:season')
  @HttpCode(HttpStatus.NO_CONTENT)
  async onUpsertSeason(
    @Param('id', ParseIntPipe) id: number,
    @Param('season') season: PricingSeasonId,
    @Body() body: UpdateSeasonPricingRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    await this.pricingService.upsertSeasonPricing(
      id,
      authenticatedUser.sub,
      season,
      body,
    );
  }

  @Put(':id/pricing/discounts')
  @HttpCode(HttpStatus.NO_CONTENT)
  async onUpsertDiscounts(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDiscountsRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    await this.pricingService.upsertDiscounts(id, authenticatedUser.sub, body);
  }

  @Put(':id/pricing/cleaning-fee')
  @HttpCode(HttpStatus.NO_CONTENT)
  async onUpdateCleaningFee(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCleaningFeeRequestDto,
    @AuthenticatedUser() authenticatedUser: IJwtClaims,
  ): Promise<void> {
    await this.pricingService.updateCleaningFee(
      id,
      authenticatedUser.sub,
      body,
    );
  }
}
