import { Error } from 'mongoose';
import { ErrorProcessor, ErrorSources } from '../interface/error';
import httpStatus from 'http-status';

const handleValidationError: ErrorProcessor<Error.ValidationError> = (err) => {
  const errorSources: ErrorSources = Object.values(err.errors).map((err) => ({
    path: err.path,
    message: err.message,
  }));

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'mongoose.Error.ValidationError',
    errorSources,
  };
};

export default handleValidationError;
