import { Injectable } from '@nestjs/common';
import {
  type ListingPermission,
  type ListingRole,
  LISTING_ROLE_PERMISSIONS,
} from '@repo/skye-hosts-api-client';
import { DatabaseService } from '../../common/providers';
import { Listing } from '../../listing/entities';
import { ListingUserRole } from '../entities';

@Injectable()
export class ListingAccessService {
  constructor(private databaseService: DatabaseService) {}

  async getListingRole(
    accountId: number,
    listingId: number,
  ): Promise<ListingRole | null> {
    const listing = await this.databaseService
      .getRepository(Listing)
      .findOne({ where: { id: listingId } });

    if (!listing) {
      return null;
    }

    if (listing.hostId === accountId) {
      return 'owner';
    }

    const userRole = await this.databaseService
      .getRepository(ListingUserRole)
      .findOne({ where: { accountId, listingId } });

    return userRole?.role ?? null;
  }

  async hasPermission(
    accountId: number,
    listingId: number,
    permission: ListingPermission,
  ): Promise<boolean> {
    const role = await this.getListingRole(accountId, listingId);
    if (!role) {
      return false;
    }
    return LISTING_ROLE_PERMISSIONS[role].includes(permission);
  }

  async getListingRolesForAccount(
    accountId: number,
  ): Promise<ListingUserRole[]> {
    return this.databaseService
      .getRepository(ListingUserRole)
      .find({ where: { accountId } });
  }
}
