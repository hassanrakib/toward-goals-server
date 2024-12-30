import { NextFunction, Request, RequestHandler, Response } from 'express';

const catchAsync = (requestHandler: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err: unknown) => {
      next(err);
    });
  };
};

export default catchAsync;
