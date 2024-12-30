import { ZodError } from 'zod';
import { ErrorProcessor, ErrorSources } from '../interface/error';
import httpStatus from 'http-status';

const handleZodError: ErrorProcessor<ZodError> = (err) => {
  // https://zod.dev/ERROR_HANDLING
  const errorSources: ErrorSources = err.issues.map((issue) => ({
    path: issue.path[issue.path.length - 1],
    message: issue.message,
  }));

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'ZodError',
    errorSources,
  };
};

export default handleZodError;
