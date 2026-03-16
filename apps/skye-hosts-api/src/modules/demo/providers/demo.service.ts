import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from '../../common/providers';
import {
  CreateSomethingDto,
  DemoFormRequestDto,
  DemoFormResponseDto,
  DemoResponseDto,
} from '../dto';
import { Demo } from '../entities';

@Injectable()
export class DemoService {
  constructor(private databaseService: DatabaseService) {}

  async getDemoData(): Promise<DemoResponseDto> {
    const result = await this.databaseService.getRepository(Demo).find();
    return {
      arbitaryProp: result[0] ? result[0].foo : 'arbitary',
    };
  }

  async submitForm(dto: DemoFormRequestDto): Promise<DemoFormResponseDto> {
    await this.databaseService.getRepository(Demo).save({
      foo: dto.name,
    } as Demo);
    return {
      id: randomUUID(),
      submittedAt: new Date().toISOString(),
    };
  }

  async saveWithTransactions(dto: CreateSomethingDto): Promise<Demo> {
    return this.databaseService.runInTransaction(async (manager) => {
      return manager.getRepository(Demo).save({
        foo: dto.foo,
      } as Demo);
    });
  }
}
