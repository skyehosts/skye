import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  type CoHostRole,
  FULL_ACCESS_INVITABLE_ROLES,
  LISTING_ROLE_PERMISSIONS,
  ListingPermission,
} from '@repo/skye-hosts-api-client';
import { createHash, randomBytes } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { AccountService } from '../../account/providers';
import { LoggerService } from '../../common/providers';
import { ConfigService } from '../../config/providers/config.service';
import { EmailTemplate } from '../../email/enums/email-template.enum';
import { ResendService } from '../../email/providers/resend.service';
import { Listing } from '../../listing/entities';
import {
  AcceptCoHostInviteResponseDto,
  CreateCoHostInviteResponseDto,
  GetCoHostInviteDetailsResponseDto,
  GetCoHostInvitesResponseDto,
  GetListingCoHostsResponseDto,
} from '../dto';
import { CoHostInvite, ListingUserRole } from '../entities';
import { ListingAccessService } from './listing-access.service';

const INVITE_EXPIRY_DAYS = 7;

@Injectable()
export class CoHostInviteService {
  private readonly appLinkBaseUrl: string;

  constructor(
    @InjectRepository(CoHostInvite)
    private readonly coHostInviteRepo: Repository<CoHostInvite>,
    @InjectRepository(ListingUserRole)
    private readonly listingUserRoleRepo: Repository<ListingUserRole>,
    @InjectRepository(Listing)
    private readonly listingRepo: Repository<Listing>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private accountService: AccountService,
    private listingAccessService: ListingAccessService,
    private resendService: ResendService,
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    this.appLinkBaseUrl = this.configService.getAll().appLinkBaseUrl;
  }

  async createInvite(
    inviterAccountId: number,
    listingId: number,
    inviteeEmail: string,
    role: CoHostRole,
  ): Promise<CreateCoHostInviteResponseDto> {
    const inviterRole = await this.listingAccessService.getListingRole(
      inviterAccountId,
      listingId,
    );

    if (!inviterRole) {
      throw new ForbiddenException('You do not have access to this listing');
    }

    if (
      !LISTING_ROLE_PERMISSIONS[inviterRole].includes(
        ListingPermission.MANAGE_COHOSTS,
      )
    ) {
      throw new ForbiddenException(
        'You do not have permission to manage co-hosts',
      );
    }

    if (
      inviterRole === 'full_access' &&
      !FULL_ACCESS_INVITABLE_ROLES.includes(role)
    ) {
      throw new ForbiddenException(
        'Full access co-hosts can only invite calendar_and_messaging or calendar_only roles',
      );
    }

    const existingInvite = await this.coHostInviteRepo.findOne({
      where: {
        listingId,
        inviteeEmail,
        status: 'pending',
      },
    });

    if (existingInvite) {
      throw new BadRequestException(
        'A pending invite already exists for this email and listing',
      );
    }

    const existingRole = await this.listingUserRoleRepo
      .createQueryBuilder('lur')
      .innerJoin('account', 'a', 'a.id = lur."accountId"')
      .where('lur."listingId" = :listingId', { listingId })
      .andWhere('a.email = :email', { email: inviteeEmail })
      .getOne();

    if (existingRole) {
      throw new BadRequestException(
        'This user already has a role on this listing',
      );
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date(
      Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    const inviteLink = `${this.appLinkBaseUrl}/invite?token=${rawToken}`;

    const invite = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.getRepository(CoHostInvite).save({
        listingId,
        inviterAccountId,
        inviteeEmail,
        role,
        status: 'pending',
        tokenHash,
        expiresAt,
        createdAt: new Date(),
      } as CoHostInvite);

      const listing = await manager
        .getRepository(Listing)
        .findOne({ where: { id: listingId } });

      const inviter = await this.accountService.findById(inviterAccountId);

      await this.resendService.sendTemplate(
        inviteeEmail,
        EmailTemplate.CoHostInvite,
        {
          inviteLink,
          listingTitle: listing?.title ?? 'a listing',
          inviterName: inviter?.name ?? 'A host',
        },
      );

      return saved;
    });

    this.logger.debug(
      `Co-host invite created: ${invite.id} for listing ${listingId}`,
    );

    return {
      inviteId: invite.id,
      inviteLink,
    };
  }

  async getInviteDetails(
    rawToken: string,
  ): Promise<GetCoHostInviteDetailsResponseDto> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const invite = await this.coHostInviteRepo.findOne({
      where: { tokenHash },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    const listing = await this.listingRepo.findOne({
      where: { id: invite.listingId },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const inviter = await this.accountService.findById(invite.inviterAccountId);

    return {
      listingTitle: listing.title,
      inviterName: inviter?.name ?? 'Unknown',
      role: invite.role,
      inviteeEmail: invite.inviteeEmail,
      status:
        invite.expiresAt < new Date() && invite.status === 'pending'
          ? 'expired'
          : invite.status,
      expiresAt: invite.expiresAt,
    };
  }

  async acceptInvite(
    rawToken: string,
    acceptingAccountId: number,
  ): Promise<AcceptCoHostInviteResponseDto> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const invite = await this.coHostInviteRepo.findOne({
      where: { tokenHash },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.status !== 'pending') {
      throw new BadRequestException(`Invite is already ${invite.status}`);
    }

    if (invite.expiresAt < new Date()) {
      invite.status = 'expired';
      await this.coHostInviteRepo.save(invite);
      throw new BadRequestException('Invite has expired');
    }

    const account = await this.accountService.findById(acceptingAccountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.email !== invite.inviteeEmail) {
      throw new ForbiddenException(
        'This invite was sent to a different email address',
      );
    }

    const existingRole = await this.listingUserRoleRepo.findOne({
      where: { accountId: acceptingAccountId, listingId: invite.listingId },
    });

    if (existingRole) {
      throw new BadRequestException('You already have a role on this listing');
    }

    await this.listingUserRoleRepo.save({
      accountId: acceptingAccountId,
      listingId: invite.listingId,
      role: invite.role,
      createdAt: new Date(),
    } as ListingUserRole);

    invite.status = 'accepted';
    await this.coHostInviteRepo.save(invite);

    this.logger.debug(
      `Co-host invite ${invite.id} accepted by account ${acceptingAccountId}`,
    );

    return {
      listingId: invite.listingId,
      role: invite.role,
    };
  }

  async getInvitesForListing(
    accountId: number,
    listingId: number,
  ): Promise<GetCoHostInvitesResponseDto> {
    const hasPermission = await this.listingAccessService.hasPermission(
      accountId,
      listingId,
      ListingPermission.MANAGE_COHOSTS,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to view invites for this listing',
      );
    }

    const invites = await this.coHostInviteRepo.find({
      where: { listingId },
      order: { createdAt: 'DESC' },
    });

    return {
      invites: invites.map((invite) => ({
        id: invite.id,
        inviteeEmail: invite.inviteeEmail,
        role: invite.role,
        status:
          invite.expiresAt < new Date() && invite.status === 'pending'
            ? 'expired'
            : invite.status,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
      })),
    };
  }

  async revokeInvite(accountId: number, inviteId: number): Promise<void> {
    const invite = await this.coHostInviteRepo.findOne({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    const hasPermission = await this.listingAccessService.hasPermission(
      accountId,
      invite.listingId,
      ListingPermission.MANAGE_COHOSTS,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to revoke this invite',
      );
    }

    if (invite.status !== 'pending') {
      throw new BadRequestException(
        `Cannot revoke an invite that is ${invite.status}`,
      );
    }

    invite.status = 'revoked';
    await this.coHostInviteRepo.save(invite);

    this.logger.debug(
      `Co-host invite ${invite.id} revoked by account ${accountId}`,
    );
  }

  async getCoHostsForListing(
    accountId: number,
    listingId: number,
  ): Promise<GetListingCoHostsResponseDto> {
    const hasPermission = await this.listingAccessService.hasPermission(
      accountId,
      listingId,
      ListingPermission.MANAGE_COHOSTS,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to view co-hosts for this listing',
      );
    }

    const roles = await this.listingUserRoleRepo.find({
      where: { listingId },
    });

    const coHosts = await Promise.all(
      roles.map(async (role) => {
        const account = await this.accountService.findById(role.accountId);
        return {
          id: role.id,
          accountId: role.accountId,
          accountName: account?.name ?? 'Unknown',
          accountEmail: account?.email ?? '',
          role: role.role,
          createdAt: role.createdAt,
        };
      }),
    );

    return { coHosts };
  }

  async removeCoHost(
    accountId: number,
    listingUserRoleId: number,
  ): Promise<void> {
    const roleToRemove = await this.listingUserRoleRepo.findOne({
      where: { id: listingUserRoleId },
    });

    if (!roleToRemove) {
      throw new NotFoundException('Co-host role not found');
    }

    const hasPermission = await this.listingAccessService.hasPermission(
      accountId,
      roleToRemove.listingId,
      ListingPermission.MANAGE_COHOSTS,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to remove co-hosts',
      );
    }

    await this.listingUserRoleRepo.delete(listingUserRoleId);

    this.logger.debug(
      `Co-host role ${listingUserRoleId} removed by account ${accountId}`,
    );
  }
}
