import type { IGetAllListingsResponseDto } from '../../../../../../packages/skye-hosts-api-client/src';
import { GetHostListingsResponseDto } from './get-host-listings-response.dto';

export class GetAllListingsResponseDto
  extends GetHostListingsResponseDto
  implements IGetAllListingsResponseDto {}
