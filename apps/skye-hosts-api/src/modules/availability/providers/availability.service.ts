import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/providers';

@Injectable()
export class AvailabilityService {
  constructor(private databaseService: DatabaseService) {}
}
