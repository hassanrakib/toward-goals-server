import { Response } from 'express';

export interface ISuccessResponse<T> {
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
  successResponse: ISuccessResponse<T>
) => {
  res.status(successResponse.statusCode).json(successResponse);
};

export default sendResponse;
