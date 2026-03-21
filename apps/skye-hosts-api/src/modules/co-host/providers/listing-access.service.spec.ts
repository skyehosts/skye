import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListingPermission } from '@repo/skye-hosts-api-client';
import { Listing } from '../../listing/entities';
import { ListingUserRole } from '../entities';
import { ListingAccessService } from './listing-access.service';

describe('ListingAccessService', () => {
  let service: ListingAccessService;
  let listingRepo: { findOne: jest.Mock };
  let listingUserRoleRepo: { findOne: jest.Mock; find: jest.Mock };

  beforeEach(async () => {
    listingRepo = { findOne: jest.fn() };
    listingUserRoleRepo = { findOne: jest.fn(), find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingAccessService,
        { provide: getRepositoryToken(Listing), useValue: listingRepo },
        {
          provide: getRepositoryToken(ListingUserRole),
          useValue: listingUserRoleRepo,
        },
      ],
    }).compile();

    service = module.get<ListingAccessService>(ListingAccessService);
  });

  describe('getListingRole', () => {
    it('should return null if listing does not exist', async () => {
      listingRepo.findOne.mockResolvedValue(null);

      const role = await service.getListingRole(1, 99);
      expect(role).toBeNull();
    });

    it('should return "owner" when account is the host', async () => {
      listingRepo.findOne.mockResolvedValue({ id: 1, hostId: 42 });

      const role = await service.getListingRole(42, 1);
      expect(role).toBe('owner');
    });

    it('should return co-host role when account has a listing user role', async () => {
      listingRepo.findOne.mockResolvedValue({ id: 1, hostId: 99 });
      listingUserRoleRepo.findOne.mockResolvedValue({
        accountId: 42,
        listingId: 1,
        role: 'full_access',
      });

      const role = await service.getListingRole(42, 1);
      expect(role).toBe('full_access');
    });

    it('should return null if account has no role on listing', async () => {
      listingRepo.findOne.mockResolvedValue({ id: 1, hostId: 99 });
      listingUserRoleRepo.findOne.mockResolvedValue(null);

      const role = await service.getListingRole(42, 1);
      expect(role).toBeNull();
    });

    it('should not check ListingUserRole when account is the owner', async () => {
      listingRepo.findOne.mockResolvedValue({ id: 1, hostId: 42 });

      await service.getListingRole(42, 1);

      expect(listingUserRoleRepo.findOne).not.toHaveBeenCalled();
    });
  });

  describe('hasPermission', () => {
    it('should return false if listing does not exist', async () => {
      listingRepo.findOne.mockResolvedValue(null);

      const result = await service.hasPermission(
        42,
        1,
        ListingPermission.EDIT_LISTING,
      );
      expect(result).toBe(false);
    });

    it('should return false if account has no role', async () => {
      listingRepo.findOne.mockResolvedValue({ id: 1, hostId: 99 });
      listingUserRoleRepo.findOne.mockResolvedValue(null);

      const result = await service.hasPermission(
        42,
        1,
        ListingPermission.EDIT_LISTING,
      );
      expect(result).toBe(false);
    });

    it('owner has all permissions including DELETE_LISTING', async () => {
      listingRepo.findOne.mockResolvedValue({ id: 1, hostId: 42 });

      for (const permission of Object.values(ListingPermission).filter(
        (v) => typeof v === 'number',
      )) {
        const result = await service.hasPermission(
          42,
          1,
          permission as ListingPermission,
        );
        expect(result).toBe(true);
      }
    });

    it('full_access can edit listing but cannot delete it', async () => {
      listingRepo.findOne.mockResolvedValue({ id: 1, hostId: 99 });
      listingUserRoleRepo.findOne.mockResolvedValue({ role: 'full_access' });

      expect(
        await service.hasPermission(42, 1, ListingPermission.EDIT_LISTING),
      ).toBe(true);
      expect(
        await service.hasPermission(42, 1, ListingPermission.DELETE_LISTING),
      ).toBe(false);
    });

    it('full_access can manage co-hosts', async () => {
      listingRepo.findOne.mockResolvedValue({ id: 1, hostId: 99 });
      listingUserRoleRepo.findOne.mockResolvedValue({ role: 'full_access' });

      const result = await service.hasPermission(
        42,
        1,
        ListingPermission.MANAGE_COHOSTS,
      );
      expect(result).toBe(true);
    });

    it('calendar_and_messaging can view calendar and message guests', async () => {
      listingRepo.findOne.mockResolvedValue({ id: 1, hostId: 99 });
      listingUserRoleRepo.findOne.mockResolvedValue({
        role: 'calendar_and_messaging',
      });

      expect(
        await service.hasPermission(42, 1, ListingPermission.VIEW_CALENDAR),
      ).toBe(true);
      expect(
        await service.hasPermission(42, 1, ListingPermission.MESSAGE_GUESTS),
      ).toBe(true);
    });

    it('calendar_and_messaging cannot edit listing or manage co-hosts', async () => {
      listingRepo.findOne.mockResolvedValue({ id: 1, hostId: 99 });
      listingUserRoleRepo.findOne.mockResolvedValue({
        role: 'calendar_and_messaging',
      });

      expect(
        await service.hasPermission(42, 1, ListingPermission.EDIT_LISTING),
      ).toBe(false);
      expect(
        await service.hasPermission(42, 1, ListingPermission.MANAGE_COHOSTS),
      ).toBe(false);
    });

    it('calendar_only can view calendar but not message guests', async () => {
      listingRepo.findOne.mockResolvedValue({ id: 1, hostId: 99 });
      listingUserRoleRepo.findOne.mockResolvedValue({ role: 'calendar_only' });

      expect(
        await service.hasPermission(42, 1, ListingPermission.VIEW_CALENDAR),
      ).toBe(true);
      expect(
        await service.hasPermission(42, 1, ListingPermission.MESSAGE_GUESTS),
      ).toBe(false);
      expect(
        await service.hasPermission(42, 1, ListingPermission.EDIT_LISTING),
      ).toBe(false);
    });
  });

  describe('getListingRolesForAccount', () => {
    it('should return all roles for the account', async () => {
      const mockRoles = [
        { accountId: 42, listingId: 1, role: 'full_access' },
        { accountId: 42, listingId: 2, role: 'calendar_only' },
      ];
      listingUserRoleRepo.find.mockResolvedValue(mockRoles);

      const roles = await service.getListingRolesForAccount(42);

      expect(roles).toEqual(mockRoles);
      expect(listingUserRoleRepo.find).toHaveBeenCalledWith({
        where: { accountId: 42 },
      });
    });

    it('should return empty array when account has no co-hosted listings', async () => {
      listingUserRoleRepo.find.mockResolvedValue([]);

      const roles = await service.getListingRolesForAccount(42);

      expect(roles).toEqual([]);
    });
  });
});
