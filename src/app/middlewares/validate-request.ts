import { ZodSchema } from 'zod';
import catchAsync from '../utils/catch-async';

const validateRequest = <T extends Record<string, unknown>>(
  schema: ZodSchema<T>
) => {
  return catchAsync(
    async (req: { body: Record<string, unknown> }, res, next) => {
      // validate and strip extra properties
      const parsedData = await schema.parseAsync({ body: req.body });

      // after stripping out extra properties that are not in the schema
      // replace the req.body with the validated data
      req.body = parsedData.body as Record<string, unknown>;
      next();
    }
  );
};

export default validateRequest;
