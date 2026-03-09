import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DataSource } from 'typeorm/data-source/DataSource';

@ValidatorConstraint({ name: 'uniqueByProperty', async: true })
@Injectable()
export class UniqueByPropertyValidator implements ValidatorConstraintInterface {
  dataSource: DataSource;
  constructor() {}
  async validate(text: string, args: ValidationArguments): Promise<boolean> {
    const entity = await this.dataSource
      .getRepository(args.constraints[0])
      .findOne({
        where: {
          [args.constraints[1]]: args.value,
        },
      });
    return Promise.resolve(!entity);
  }
  setDataSource(dataSource: DataSource) {
    this.dataSource = dataSource;
  }
}
