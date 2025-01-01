import { ZodSchema } from 'zod';
import catchAsync from '../utils/catch-async';

const validateRequest = <T>(schema: ZodSchema<T>) => {
  return catchAsync(
    async (req: { body: Record<string, unknown> }, res, next) => {
      await schema.parseAsync({ body: req.body });
      next();
    }
  );
};

export default validateRequest;
