import {
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ArgumentsHost,
  ValidationPipe,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ValidateInputPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new UnprocessableEntityException(validationErrors);
      },
    });
  }

  public async transform(value, metadata: ArgumentMetadata) {
    try {
      return await super.transform(value, metadata);
    } catch (e) {
      const error = e;
      if (e instanceof UnprocessableEntityException) {
        throw new UnprocessableEntityException(
          this.handleError(error.response.message),
        );
      }
    }
  }

  private handleError(errors) {
    const errorsArray = [];
    errors.forEach(
      (error, index) =>
        (errorsArray[index] = {
          [error.property]: Object.values(error.constraints),
        }),
    );
    return errorsArray;
  }
}
