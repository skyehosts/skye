import type { IGetAllListingsResponseDto } from '@repo/book-skye-api-client';
import { GetHostListingsResponseDto } from './get-host-listings-response.dto';

export class GetAllListingsResponseDto
  extends GetHostListingsResponseDto
  implements IGetAllListingsResponseDto {}
