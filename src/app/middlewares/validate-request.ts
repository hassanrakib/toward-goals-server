import { ZodSchema } from 'zod';
import catchAsync from '../utils/catch-async';
import { Request, Response, NextFunction } from 'express';

const validateRequest = <T>(schema: ZodSchema<T>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync({ body: req.body as T });
    next();
  });
};

export default validateRequest;
