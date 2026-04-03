import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

interface CheckInCheckoutFields {
  checkInTimeStart?: string | null;
  checkInTimeEnd?: string | null;
  checkOutTime?: string | null;
}

@ValidatorConstraint({ name: 'checkInEndAfterStart', async: false })
export class CheckInEndAfterStart implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const obj = args.object as CheckInCheckoutFields;
    if (!obj.checkInTimeStart || !obj.checkInTimeEnd) return true;
    return obj.checkInTimeEnd > obj.checkInTimeStart;
  }

  defaultMessage() {
    return 'Check-in end time must be after check-in start time';
  }
}

@ValidatorConstraint({ name: 'checkoutBeforeCheckIn', async: false })
export class CheckoutBeforeCheckIn implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments) {
    const obj = args.object as CheckInCheckoutFields;
    if (!obj.checkInTimeStart || !obj.checkOutTime) return true;
    return obj.checkOutTime < obj.checkInTimeStart;
  }

  defaultMessage() {
    return 'Checkout time must be before check-in start time';
  }
}
