import { z } from 'zod';
import isMongoId from 'validator/es/lib/isMongoId';

const createGoalSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(5, { message: 'Title must be at least 5 characters long' })
      .max(50, { message: 'Title cannot exceed 50 characters' })
      .trim(),
    image: z
      .string()
      .url({ message: 'Invalid image URL' })
      .optional()
      .default(''),
    creator: z
      .string({ required_error: 'Creator is required' })
      .refine((id) => isMongoId(id), {
        message: 'Invalid creator id',
      }),
    admins: z
      .array(
        z.string().refine((id) => isMongoId(id), {
          message: 'Invalid admin id',
        })
      )
      .max(5, { message: 'Admins list exceeds the maximum allowed number' })
      .optional()
      .default([]),

    users: z
      .array(
        z
          .string({ required_error: 'Users field is required' })
          .refine((id) => isMongoId(id), { message: 'Invalid user id' })
      )
      .nonempty({ message: 'Users list can not be empty' })
      .max(200, { message: 'User list exceeds the maximum allowed number' }),
    userLimit: z
      .number({ required_error: 'User limit is required' })
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
      .gte(7, { message: 'Duration must be at least 7 days' })
      .lte(365 * 5, { message: 'Duration cannot exceed 5 years' }),
  }),
});

export const goalValidations = {
  createGoalSchema,
};
