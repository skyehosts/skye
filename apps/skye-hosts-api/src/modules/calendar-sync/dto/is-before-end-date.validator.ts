import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isBeforeEndDate', async: false })
export class IsBeforeEndDate implements ValidatorConstraintInterface {
  validate(_: string, args: ValidationArguments) {
    const obj = args.object as { startDate: string; endDate: string };
    return obj.startDate < obj.endDate;
  }

  defaultMessage() {
    return 'startDate must be before endDate';
  }
}
