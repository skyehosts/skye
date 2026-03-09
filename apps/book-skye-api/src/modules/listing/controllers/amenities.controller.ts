import { Controller, Get } from '@nestjs/common';
import { LISTING_AMENITY_CATEGORIES } from '@repo/skye-hosts-api-client';
import { IgnoreBearerAuthentication } from '../../common/decorators';
import { GetAmenitiesResponseDto } from '../dto';

@Controller('listing/amenities')
export class AmenitiesController {
  @Get()
  @IgnoreBearerAuthentication()
  async onGetAmenities(): Promise<GetAmenitiesResponseDto> {
    return {
      categories: LISTING_AMENITY_CATEGORIES,
    };
  }
}
