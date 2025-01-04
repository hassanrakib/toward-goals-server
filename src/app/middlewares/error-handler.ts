import { ErrorRequestHandler } from 'express';
import httpStatus from 'http-status';
import { Error11000, ErrorResponse } from '../interface/error';
import config from '../config';
import AppError from '../errors/AppError';
import { ZodError } from 'zod';
import handleZodError from '../errors/handleZodError';
import { Error, mongo } from 'mongoose';
import handleValidationError from '../errors/handleValidationError';
import handleCastError from '../errors/handleCastError';
import handleDuplicateValueError from '../errors/handleDuplicateValueError';
import regenerateErrorResponse from '../errors/regenarateErrorResponse';
import { MulterError } from 'multer';
import handleMulterError from '../errors/handleMulterError';

const errorHandler =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (): ErrorRequestHandler => (err: unknown, req, res, next) => {
    // default error response
    const errorResponse: ErrorResponse = {
      success: false,
      statusCode: Number(httpStatus.INTERNAL_SERVER_ERROR),
      message: 'Something went wrong',
      errorSources: [{ path: '', message: 'Something went wrong' }],
      stack: config.NODE_ENV === 'development' ? (err as Error).stack! : null,
    };

    if (err instanceof ZodError) {
      regenerateErrorResponse(err, handleZodError, errorResponse);
    }

    if (err instanceof Error.ValidationError) {
      regenerateErrorResponse(err, handleValidationError, errorResponse);
    }

    if (err instanceof Error.CastError) {
      regenerateErrorResponse(err, handleCastError, errorResponse);
    }

    if (err instanceof mongo.MongoServerError && err.code === 11000) {
      regenerateErrorResponse(
        err as Error11000,
        handleDuplicateValueError,
        errorResponse
      );
    }

    if (err instanceof MulterError) {
      regenerateErrorResponse(err, handleMulterError, errorResponse);
    }

    if (err instanceof AppError) {
      errorResponse.statusCode = err.statusCode;
      errorResponse.message = err.message;
      errorResponse.errorSources = [
        {
          path: '',
          message: err.message,
        },
      ];
    }

    if (err instanceof Error) {
      errorResponse.message = err.message;
      errorResponse.errorSources = [
        {
          path: '',
          message: err.message,
        },
      ];
    }

    res.status(errorResponse.statusCode).json(errorResponse);
  };

export default errorHandler;
