import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import {
  CreateSomethingDto,
  DemoFormRequestDto,
  DemoFormResponseDto,
  DemoResponseDto,
} from '../dto';
import { Demo } from '../entities';

@Injectable()
export class DemoService {
  constructor(
    @InjectRepository(Demo)
    private readonly demoRepo: Repository<Demo>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getDemoData(): Promise<DemoResponseDto> {
    const result = await this.demoRepo.find();
    return {
      arbitaryProp: result[0] ? result[0].foo : 'arbitary',
    };
  }

  async submitForm(dto: DemoFormRequestDto): Promise<DemoFormResponseDto> {
    await this.demoRepo.save({
      foo: dto.name,
    } as Demo);
    return {
      id: randomUUID(),
      submittedAt: new Date().toISOString(),
    };
  }

  async saveWithTransactions(dto: CreateSomethingDto): Promise<Demo> {
    return this.dataSource.transaction(async (manager) => {
      return manager.getRepository(Demo).save({
        foo: dto.foo,
      } as Demo);
    });
  }
}
