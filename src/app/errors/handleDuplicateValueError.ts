import httpStatus from 'http-status';
import { Error11000, ErrorProcessor, ErrorSources } from '../interface/error';

const handleDuplicateValueError: ErrorProcessor<Error11000> = (err) => {
  const errorSources: ErrorSources = [
    {
      path: Object.keys(err.keyValue)[0],
      message: err.message,
    },
  ];

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Error11000',
    errorSources,
  };
};

export default handleDuplicateValueError;
