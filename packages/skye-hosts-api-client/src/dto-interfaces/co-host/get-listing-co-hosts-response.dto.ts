import type { CoHostRole } from '../../enums/co-host-enums';

export interface IListingCoHostDto {
  id: number;
  accountId: number;
  accountName: string;
  accountEmail: string;
  role: CoHostRole;
  createdAt: Date;
}

export interface IGetListingCoHostsResponseDto {
  coHosts: IListingCoHostDto[];
}
