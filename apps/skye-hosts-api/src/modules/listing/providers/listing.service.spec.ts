import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListingPermission } from '@repo/skye-hosts-api-client';
import { DataSource, In } from 'typeorm';
import { Account } from '../../account/entities/account.entity';
import { Booking } from '../../booking/entities';
import { CalendarBlock, CalendarSync } from '../../calendar-sync/entities';
import { CoHostInvite, ListingUserRole } from '../../co-host/entities';
import { ListingAccessService } from '../../co-host/providers/listing-access.service';
import { ConfigService } from '../../config/providers/config.service';
import { Favourite } from '../../favourite/entities';
import { ListingImage } from '../../listing-image/entities';
import {
  MessageLog,
  ScheduledMessage,
  SentMessage,
} from '../../scheduled-message/entities';
import { Listing } from '../entities';
import { ListingPricingService } from './listing-pricing.service';
import { ListingService } from './listing.service';

describe('ListingService', () => {
  let service: ListingService;
  let dataSource: { transaction: jest.Mock };
  let listingAccessService: { hasPermission: jest.Mock };
  let listingRepo: { findOne: jest.Mock; manager: { count: jest.Mock } };

  beforeEach(async () => {
    dataSource = { transaction: jest.fn() };
    listingAccessService = { hasPermission: jest.fn() };
    listingRepo = {
      findOne: jest.fn(),
      manager: { count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingService,
        { provide: getRepositoryToken(Listing), useValue: listingRepo },
        { provide: getRepositoryToken(Account), useValue: {} },
        { provide: getRepositoryToken(ListingImage), useValue: {} },
        { provide: ListingAccessService, useValue: listingAccessService },
        {
          provide: ListingPricingService,
          useValue: { hasCompletePricing: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: ConfigService,
          useValue: {
            getAll: () => ({ awsCloudfrontImagesDomain: 'cdn.test.com' }),
          },
        },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(ListingService);
  });

  describe('delete', () => {
    const listingId = 1;
    const accountId = 42;

    it('should delete listing and all related entities in a transaction', async () => {
      listingAccessService.hasPermission.mockResolvedValue(true);
      listingRepo.findOne.mockResolvedValue({ id: listingId });
      listingRepo.manager.count.mockResolvedValue(0);

      const mockManager = {
        find: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue({ affected: 0 }),
      };
      dataSource.transaction.mockImplementation(
        (cb: (m: typeof mockManager) => Promise<void>) => cb(mockManager),
      );

      await service.delete(listingId, accountId);

      expect(listingAccessService.hasPermission).toHaveBeenCalledWith(
        accountId,
        listingId,
        ListingPermission.DELETE_LISTING,
      );
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockManager.delete).toHaveBeenCalledWith(ScheduledMessage, {
        listingId,
      });
      expect(mockManager.delete).toHaveBeenCalledWith(Booking, { listingId });
      expect(mockManager.delete).toHaveBeenCalledWith(CoHostInvite, {
        listingId,
      });
      expect(mockManager.delete).toHaveBeenCalledWith(ListingUserRole, {
        listingId,
      });
      expect(mockManager.delete).toHaveBeenCalledWith(Favourite, { listingId });
      expect(mockManager.delete).toHaveBeenCalledWith(CalendarBlock, {
        listingId,
      });
      expect(mockManager.delete).toHaveBeenCalledWith(CalendarSync, {
        listingId,
      });
      expect(mockManager.delete).toHaveBeenCalledWith(Listing, {
        id: listingId,
      });
    });

    it('should delete SentMessage and MessageLog when scheduled messages exist', async () => {
      listingAccessService.hasPermission.mockResolvedValue(true);
      listingRepo.findOne.mockResolvedValue({ id: listingId });
      listingRepo.manager.count.mockResolvedValue(0);

      const scheduledMessages = [{ id: 10 }, { id: 20 }];
      const mockManager = {
        find: jest.fn().mockResolvedValue(scheduledMessages),
        delete: jest.fn().mockResolvedValue({ affected: 0 }),
      };
      dataSource.transaction.mockImplementation(
        (cb: (m: typeof mockManager) => Promise<void>) => cb(mockManager),
      );

      await service.delete(listingId, accountId);

      expect(mockManager.delete).toHaveBeenCalledWith(SentMessage, {
        scheduledMessageId: In([10, 20]),
      });
      expect(mockManager.delete).toHaveBeenCalledWith(MessageLog, {
        scheduledMessageId: In([10, 20]),
      });
    });

    it('should throw ForbiddenException when permission is denied', async () => {
      listingRepo.findOne.mockResolvedValue({ id: listingId });
      listingAccessService.hasPermission.mockResolvedValue(false);

      await expect(service.delete(listingId, accountId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when listing does not exist', async () => {
      listingAccessService.hasPermission.mockResolvedValue(true);
      listingRepo.findOne.mockResolvedValue(null);

      await expect(service.delete(listingId, accountId)).rejects.toThrow(
        NotFoundException,
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when future confirmed bookings exist', async () => {
      listingAccessService.hasPermission.mockResolvedValue(true);
      listingRepo.findOne.mockResolvedValue({ id: listingId });
      listingRepo.manager.count.mockResolvedValue(2);

      await expect(service.delete(listingId, accountId)).rejects.toThrow(
        BadRequestException,
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should propagate the error when a transaction delete fails', async () => {
      listingAccessService.hasPermission.mockResolvedValue(true);
      listingRepo.findOne.mockResolvedValue({ id: listingId });
      listingRepo.manager.count.mockResolvedValue(0);

      const mockManager = {
        find: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockRejectedValue(new Error('DB constraint error')),
      };
      dataSource.transaction.mockImplementation(
        (cb: (m: typeof mockManager) => Promise<void>) => cb(mockManager),
      );

      await expect(service.delete(listingId, accountId)).rejects.toThrow(
        'DB constraint error',
      );
    });
  });
});
