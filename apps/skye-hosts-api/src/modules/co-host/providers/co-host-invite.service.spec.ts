import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListingPermission } from '@repo/skye-hosts-api-client';
import { createHash, randomBytes } from 'crypto';
import { DataSource } from 'typeorm';
import { AccountService } from '../../account/providers';
import { LoggerService } from '../../common/providers';
import { ConfigService } from '../../config/providers/config.service';
import { ResendService } from '../../email/providers/resend.service';
import { Listing } from '../../listing/entities';
import { CoHostInvite, ListingUserRole } from '../entities';
import { CoHostInviteService } from './co-host-invite.service';
import { ListingAccessService } from './listing-access.service';

function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

describe('CoHostInviteService', () => {
  let service: CoHostInviteService;
  let coHostInviteRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let listingUserRoleRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let listingRepo: { findOne: jest.Mock };
  let accountService: Partial<Record<keyof AccountService, jest.Mock>>;
  let listingAccessService: {
    getListingRole: jest.Mock;
    hasPermission: jest.Mock;
  };
  let queryBuilderMock: {
    innerJoin: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    getOne: jest.Mock;
  };

  beforeEach(async () => {
    queryBuilderMock = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    coHostInviteRepo = {
      findOne: jest.fn(),
      save: jest
        .fn()
        .mockImplementation((entity) => Promise.resolve({ id: 1, ...entity })),
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
    };

    listingUserRoleRepo = {
      findOne: jest.fn(),
      save: jest
        .fn()
        .mockImplementation((entity) => Promise.resolve({ id: 10, ...entity })),
      find: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
    };

    listingRepo = { findOne: jest.fn() };

    const mockManager = {
      getRepository: jest.fn((entity) => {
        if (entity === CoHostInvite) return coHostInviteRepo;
        if (entity === ListingUserRole) return listingUserRoleRepo;
        if (entity === Listing) return listingRepo;
        return null;
      }),
    };

    const mockDataSource = {
      transaction: jest.fn((work) => work(mockManager)),
    };

    accountService = {
      findById: jest.fn(),
    };

    listingAccessService = {
      getListingRole: jest.fn(),
      hasPermission: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoHostInviteService,
        {
          provide: getRepositoryToken(CoHostInvite),
          useValue: coHostInviteRepo,
        },
        {
          provide: getRepositoryToken(ListingUserRole),
          useValue: listingUserRoleRepo,
        },
        { provide: getRepositoryToken(Listing), useValue: listingRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: AccountService, useValue: accountService },
        { provide: ListingAccessService, useValue: listingAccessService },
        {
          provide: ResendService,
          useValue: { sendTemplate: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: ConfigService,
          useValue: {
            getAll: jest.fn().mockReturnValue({
              appLinkBaseUrl: 'https://skyehosts.co.uk',
            }),
          },
        },
        {
          provide: LoggerService,
          useValue: { debug: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<CoHostInviteService>(CoHostInviteService);
  });

  describe('createInvite', () => {
    beforeEach(() => {
      listingAccessService.getListingRole.mockResolvedValue('owner');
      coHostInviteRepo.findOne.mockResolvedValue(null);
      queryBuilderMock.getOne.mockResolvedValue(null);
    });

    it('should create an invite and return a deep link', async () => {
      const result = await service.createInvite(
        1,
        10,
        'cohost@example.com',
        'full_access',
      );

      expect(result.inviteId).toBe(1);
      expect(result.inviteLink).toMatch(
        /^https:\/\/skyehosts\.co\.uk\/invite\?token=[a-f0-9]{64}$/,
      );
      expect(coHostInviteRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          listingId: 10,
          inviterAccountId: 1,
          inviteeEmail: 'cohost@example.com',
          role: 'full_access',
          status: 'pending',
        }),
      );
    });

    it('should throw ForbiddenException if inviter has no role on the listing', async () => {
      listingAccessService.getListingRole.mockResolvedValue(null);

      await expect(
        service.createInvite(1, 10, 'cohost@example.com', 'full_access'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if inviter has no MANAGE_COHOSTS permission (calendar_only role)', async () => {
      listingAccessService.getListingRole.mockResolvedValue('calendar_only');

      await expect(
        service.createInvite(1, 10, 'cohost@example.com', 'calendar_only'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if full_access tries to invite full_access', async () => {
      listingAccessService.getListingRole.mockResolvedValue('full_access');

      await expect(
        service.createInvite(1, 10, 'cohost@example.com', 'full_access'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('full_access can invite calendar_and_messaging role', async () => {
      listingAccessService.getListingRole.mockResolvedValue('full_access');

      const result = await service.createInvite(
        1,
        10,
        'cohost@example.com',
        'calendar_and_messaging',
      );

      expect(result.inviteId).toBeDefined();
    });

    it('should throw BadRequestException if pending invite already exists', async () => {
      coHostInviteRepo.findOne.mockResolvedValue({
        id: 5,
        status: 'pending',
        inviteeEmail: 'cohost@example.com',
        listingId: 10,
      });

      await expect(
        service.createInvite(1, 10, 'cohost@example.com', 'full_access'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user already has a role on the listing', async () => {
      queryBuilderMock.getOne.mockResolvedValue({
        id: 3,
        listingId: 10,
        role: 'calendar_only',
      });

      await expect(
        service.createInvite(1, 10, 'cohost@example.com', 'full_access'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should store a hashed token, not the raw token', async () => {
      await service.createInvite(1, 10, 'cohost@example.com', 'full_access');

      const savedEntity = coHostInviteRepo.save.mock.calls[0][0];
      expect(savedEntity.tokenHash).toHaveLength(64);
      expect(savedEntity.tokenHash).not.toContain('://');
    });

    it('should set expiry 7 days in the future', async () => {
      const before = new Date();
      await service.createInvite(1, 10, 'cohost@example.com', 'full_access');
      const after = new Date();

      const savedEntity = coHostInviteRepo.save.mock.calls[0][0];
      const expiryMs = savedEntity.expiresAt.getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      expect(expiryMs).toBeGreaterThanOrEqual(
        before.getTime() + sevenDaysMs - 1000,
      );
      expect(expiryMs).toBeLessThanOrEqual(after.getTime() + sevenDaysMs);
    });
  });

  describe('getInviteDetails', () => {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);

    it('should return invite details for a valid token', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      coHostInviteRepo.findOne.mockResolvedValue({
        id: 1,
        tokenHash,
        listingId: 10,
        inviterAccountId: 5,
        inviteeEmail: 'cohost@example.com',
        role: 'full_access',
        status: 'pending',
        expiresAt: futureDate,
      });
      listingRepo.findOne.mockResolvedValue({ id: 10, title: 'Test Listing' });
      accountService.findById.mockResolvedValue({ id: 5, name: 'Test Host' });

      const result = await service.getInviteDetails(rawToken);

      expect(result.listingTitle).toBe('Test Listing');
      expect(result.inviterName).toBe('Test Host');
      expect(result.role).toBe('full_access');
      expect(result.inviteeEmail).toBe('cohost@example.com');
      expect(result.status).toBe('pending');
    });

    it('should return "expired" status for expired pending invites', async () => {
      const pastDate = new Date(Date.now() - 86400000);
      coHostInviteRepo.findOne.mockResolvedValue({
        id: 1,
        tokenHash,
        listingId: 10,
        inviterAccountId: 5,
        inviteeEmail: 'cohost@example.com',
        role: 'full_access',
        status: 'pending',
        expiresAt: pastDate,
      });
      listingRepo.findOne.mockResolvedValue({ id: 10, title: 'Test Listing' });
      accountService.findById.mockResolvedValue({ id: 5, name: 'Test Host' });

      const result = await service.getInviteDetails(rawToken);

      expect(result.status).toBe('expired');
    });

    it('should throw NotFoundException for unknown token', async () => {
      coHostInviteRepo.findOne.mockResolvedValue(null);

      await expect(service.getInviteDetails(rawToken)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('acceptInvite', () => {
    const rawToken = randomBytes(32).toString('hex');
    const futureDate = new Date(Date.now() + 86400000);

    function pendingInvite(overrides = {}) {
      return {
        id: 1,
        tokenHash: hashToken(rawToken),
        listingId: 10,
        inviteeEmail: 'cohost@example.com',
        role: 'full_access',
        status: 'pending',
        expiresAt: futureDate,
        ...overrides,
      };
    }

    it('should create a ListingUserRole and mark invite as accepted', async () => {
      coHostInviteRepo.findOne.mockResolvedValue(pendingInvite());
      accountService.findById.mockResolvedValue({
        id: 42,
        email: 'cohost@example.com',
      });
      listingUserRoleRepo.findOne.mockResolvedValue(null);

      const result = await service.acceptInvite(rawToken, 42);

      expect(result.listingId).toBe(10);
      expect(result.role).toBe('full_access');
      expect(listingUserRoleRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: 42,
          listingId: 10,
          role: 'full_access',
        }),
      );
      expect(coHostInviteRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'accepted' }),
      );
    });

    it('should throw NotFoundException for unknown token', async () => {
      coHostInviteRepo.findOne.mockResolvedValue(null);

      await expect(service.acceptInvite(rawToken, 42)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if invite is already accepted', async () => {
      coHostInviteRepo.findOne.mockResolvedValue(
        pendingInvite({ status: 'accepted' }),
      );

      await expect(service.acceptInvite(rawToken, 42)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if invite is revoked', async () => {
      coHostInviteRepo.findOne.mockResolvedValue(
        pendingInvite({ status: 'revoked' }),
      );

      await expect(service.acceptInvite(rawToken, 42)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if invite has expired', async () => {
      coHostInviteRepo.findOne.mockResolvedValue(
        pendingInvite({ expiresAt: new Date(Date.now() - 86400000) }),
      );
      accountService.findById.mockResolvedValue({
        id: 42,
        email: 'cohost@example.com',
      });

      await expect(service.acceptInvite(rawToken, 42)).rejects.toThrow(
        BadRequestException,
      );
      expect(coHostInviteRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'expired' }),
      );
    });

    it('should throw ForbiddenException if account email does not match invitee email', async () => {
      coHostInviteRepo.findOne.mockResolvedValue(pendingInvite());
      accountService.findById.mockResolvedValue({
        id: 42,
        email: 'someone-else@example.com',
      });

      await expect(service.acceptInvite(rawToken, 42)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if account already has a role on the listing', async () => {
      coHostInviteRepo.findOne.mockResolvedValue(pendingInvite());
      accountService.findById.mockResolvedValue({
        id: 42,
        email: 'cohost@example.com',
      });
      listingUserRoleRepo.findOne.mockResolvedValue({
        id: 7,
        accountId: 42,
        listingId: 10,
        role: 'calendar_only',
      });

      await expect(service.acceptInvite(rawToken, 42)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('revokeInvite', () => {
    beforeEach(() => {
      listingAccessService.hasPermission.mockResolvedValue(true);
    });

    it('should mark invite as revoked', async () => {
      const invite = {
        id: 1,
        listingId: 10,
        status: 'pending',
      };
      coHostInviteRepo.findOne.mockResolvedValue(invite);

      await service.revokeInvite(1, 1);

      expect(coHostInviteRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'revoked' }),
      );
    });

    it('should throw NotFoundException if invite does not exist', async () => {
      coHostInviteRepo.findOne.mockResolvedValue(null);

      await expect(service.revokeInvite(1, 99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if caller has no MANAGE_COHOSTS permission', async () => {
      coHostInviteRepo.findOne.mockResolvedValue({
        id: 1,
        listingId: 10,
        status: 'pending',
      });
      listingAccessService.hasPermission.mockResolvedValue(false);

      await expect(service.revokeInvite(99, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if invite is not pending', async () => {
      coHostInviteRepo.findOne.mockResolvedValue({
        id: 1,
        listingId: 10,
        status: 'accepted',
      });

      await expect(service.revokeInvite(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should verify permission using MANAGE_COHOSTS', async () => {
      coHostInviteRepo.findOne.mockResolvedValue({
        id: 1,
        listingId: 10,
        status: 'pending',
      });

      await service.revokeInvite(1, 1);

      expect(listingAccessService.hasPermission).toHaveBeenCalledWith(
        1,
        10,
        ListingPermission.MANAGE_COHOSTS,
      );
    });
  });

  describe('removeCoHost', () => {
    beforeEach(() => {
      listingAccessService.hasPermission.mockResolvedValue(true);
    });

    it('should delete the listing user role', async () => {
      listingUserRoleRepo.findOne.mockResolvedValue({
        id: 5,
        listingId: 10,
        accountId: 42,
        role: 'full_access',
      });

      await service.removeCoHost(1, 5);

      expect(listingUserRoleRepo.delete).toHaveBeenCalledWith(5);
    });

    it('should throw NotFoundException if role does not exist', async () => {
      listingUserRoleRepo.findOne.mockResolvedValue(null);

      await expect(service.removeCoHost(1, 99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if caller lacks MANAGE_COHOSTS permission', async () => {
      listingUserRoleRepo.findOne.mockResolvedValue({
        id: 5,
        listingId: 10,
      });
      listingAccessService.hasPermission.mockResolvedValue(false);

      await expect(service.removeCoHost(99, 5)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
