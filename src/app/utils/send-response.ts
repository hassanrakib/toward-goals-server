import { Response } from 'express';

interface SuccessResponse<T> {
  statusCode: number;
  success: true;
  message: string;
  data: T;
  meta?: {
    totalDocuments: number;
    totalPage: number;
    currentPage: number;
    limit: number;
  };
}

const sendResponse = <T>(
  res: Response,
  successResponse: SuccessResponse<T>
) => {
  res.status(successResponse.statusCode).json(successResponse);
};

export default sendResponse;
