import { ValidationError } from 'class-validator';

export class DtoValidationError {
  validationErrors: { message: string }[];

  constructor(errors: ValidationError[]) {
    const extractedErrorMessages = this.getAllConstraints(errors);
    this.validationErrors = extractedErrorMessages.map((message) => ({
      message,
    }));
  }

  private getAllConstraints(errors: ValidationError[]): string[] {
    const constraints: string[] = [];
    for (const error of errors) {
      if (error.constraints) {
        const constraintValues = Object.values(error.constraints);
        constraints.push(...constraintValues);
      }
      if (error.children) {
        const childConstraints = this.getAllConstraints(error.children);
        constraints.push(...childConstraints);
      }
    }
    return constraints;
  }
}
