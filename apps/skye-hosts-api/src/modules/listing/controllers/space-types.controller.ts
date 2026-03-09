import { Controller, Get } from '@nestjs/common';
import { IgnoreBearerAuthentication } from '../../common/decorators';
import { GetSpaceTypesResponseDto, SPACE_TYPES } from '../dto';

@Controller('listing/space-types')
export class SpaceTypesController {
  @Get()
  @IgnoreBearerAuthentication()
  async onGetSpaceTypes(): Promise<GetSpaceTypesResponseDto> {
    return { types: SPACE_TYPES };
  }
}
