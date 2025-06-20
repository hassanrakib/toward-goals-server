// import { isMongoId } from 'validator';
import { z } from 'zod';

const createGoalSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(5, { message: 'Title must be at least 5 characters long' })
      .max(60, { message: 'Title cannot exceed 60 characters' })
      .trim(),
    // admins: z
    //   .array(
    //     z.string().refine((id) => isMongoId(id), {
    //       message: 'Invalid admin id',
    //     })
    //   )
    //   .max(5, { message: 'Admins list exceeds the maximum allowed number' })
    //   .optional()
    //   .default([]),
    userLimit: z
      .number({ required_error: 'User limit is required' })
      .int({ message: 'User limit can not be a decimal number' })
      .positive({ message: 'User limit must be at least 1' })
      .lte(200, { message: 'User limit cannot exceed 200' }),
    startDate: z
      .string({ required_error: 'Start date is required' })
      .datetime({ message: 'Invalid start date string' })
      .refine((date) => new Date(date) > new Date(), {
        message: 'Start date must be in the future',
      }),
    duration: z
      .number({ required_error: 'Duration is required' })
      .int({ message: 'Duration must be in days' })
      .gte(7, { message: 'Duration must be at least 7 days' })
      .lte(365 * 5, { message: 'Duration cannot exceed 5 years' }),
  }),
});

export const goalValidations = {
  createGoalSchema,
};
