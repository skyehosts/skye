import { Controller, Get } from '@nestjs/common';
import { IgnoreBearerAuthentication } from '../../common/decorators';
import { ACCOMMODATION_TYPES, GetAccommodationTypesResponseDto } from '../dto';

@Controller('listing/accommodation-types')
export class AccommodationTypesController {
  @Get()
  @IgnoreBearerAuthentication()
  async onGetAccommodationTypes(): Promise<GetAccommodationTypesResponseDto> {
    return { types: ACCOMMODATION_TYPES };
  }
}
