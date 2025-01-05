import { MulterError } from 'multer';
import { ErrorProcessor, ErrorSources } from '../interface/error';
import httpStatus from 'http-status';

const handleMulterError: ErrorProcessor<MulterError> = (err) => {
  const errorSources: ErrorSources = [
    {
      path: err.field ?? '',
      message: err.message,
    },
  ];

  let statusCode: number = httpStatus.BAD_REQUEST;
  let message = err.message;

  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      statusCode = httpStatus.REQUEST_ENTITY_TOO_LARGE;
      message = 'File too large. Maximum allowed size is 5MB.';
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files uploaded. Maximum allowed is 10 files.';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected file field in the request.';
      break;
  }

  return {
    statusCode,
    message,
    errorSources,
  };
};

export default handleMulterError;
