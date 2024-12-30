import { ErrorProcessor, ErrorResponse } from '../interface/error';

function regenerateErrorResponse<T>(
  err: T,
  errorProcessor: ErrorProcessor<T>,
  errorResponse: ErrorResponse
) {
  const generalizedError = errorProcessor(err);

  errorResponse.statusCode = generalizedError.statusCode;
  errorResponse.message = generalizedError.message;
  errorResponse.errorSources = generalizedError.errorSources;
}

export default regenerateErrorResponse;
