import { Controller, Get } from '@nestjs/common';
import { LISTING_AMENITY_CATEGORIES } from '../../../../../../packages/skye-hosts-api-client/src';
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
