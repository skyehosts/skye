import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AuthenticatedUser } from '../../common/decorators/authenticated-user.decorator';
import { AuthoriseRole } from '../../common/decorators/authorise-role.decorator';
import type { IJwtClaims } from '../../common/guards/bearer-authentication.guard';
import {
  GetFavouritesResponseDto,
  ToggleFavouriteRequestDto,
  ToggleFavouriteResponseDto,
} from '../dto';
import { FavouriteService } from '../providers/favourite.service';

@Controller('favourite')
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) {}

  @Post('toggle')
  @AuthoriseRole('guest')
  async onToggle(
    @Body() body: ToggleFavouriteRequestDto,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<ToggleFavouriteResponseDto> {
    return this.favouriteService.toggle(user.sub, body.listingId);
  }

  @Get()
  @AuthoriseRole('guest')
  async onGetFavourites(
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<GetFavouritesResponseDto> {
    return this.favouriteService.getFavourites(user.sub);
  }

  @Get('check/:listingId')
  @AuthoriseRole('guest')
  async onCheckFavourite(
    @Param('listingId', ParseIntPipe) listingId: number,
    @AuthenticatedUser() user: IJwtClaims,
  ): Promise<ToggleFavouriteResponseDto> {
    return this.favouriteService.checkFavourite(user.sub, listingId);
  }
}
