// import { isMongoId } from 'validator';
import { z } from 'zod';

const createSubgoalSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(5, { message: 'Title must be at least 5 characters long' })
      .max(50, { message: 'Title cannot exceed 50 characters' })
      .trim(),
    duration: z
      .number({ required_error: 'Duration is required' })
      .int({ message: 'Duration must be in days' })
      .gte(1, { message: 'Duration must be at least 1 day' })
      .lte(365, { message: 'Duration cannot exceed 1 year' }),
    usageCount: z
      .number()
      .int({ message: 'User count must be integer' })
      .min(0, { message: 'Usage count must be atleast 0' })
      .optional(),
  }),
});

export const subgoalValidations = { createSubgoalSchema };
