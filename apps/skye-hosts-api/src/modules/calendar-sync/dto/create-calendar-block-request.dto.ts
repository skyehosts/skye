import type { ICreateCalendarBlockRequestDto } from '@repo/skye-hosts-api-client';
import {
  IsDateString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isBeforeEndDate', async: false })
class IsBeforeEndDate implements ValidatorConstraintInterface {
  validate(_: string, args: ValidationArguments) {
    const obj = args.object as CreateCalendarBlockRequestDto;
    return obj.startDate < obj.endDate;
  }

  defaultMessage() {
    return 'startDate must be before endDate';
  }
}

export class CreateCalendarBlockRequestDto implements ICreateCalendarBlockRequestDto {
  @IsDateString()
  @Validate(IsBeforeEndDate)
  startDate: string;

  @IsDateString()
  endDate: string;
}
