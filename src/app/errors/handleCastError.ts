import { Error } from 'mongoose';
import { ErrorProcessor, ErrorSources } from '../interface/error';
import httpStatus from 'http-status';

const handleCastError: ErrorProcessor<Error.CastError> = (err) => {
  const errorSources: ErrorSources = [
    {
      path: err.path,
      message: err.message,
    },
  ];

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'mongoose.Error.CastError',
    errorSources,
  };
};

export default handleCastError;
