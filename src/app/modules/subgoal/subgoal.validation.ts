import { isMongoId } from 'validator';
import { z } from 'zod';

const createSubgoalSchema = z.object({
  body: z.object({
    goal: z
      .string({
        required_error: 'Goal is required',
      })
      .refine((id) => isMongoId(id), {
        message: 'Goal id is not valid',
      }),
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
    keyMilestones: z
      .array(
        z.string().min(3, 'Each milestone must be at least 3 characters long')
      )
      .min(2, 'There must be at least 2 milestones')
      .max(4, 'There must be no more than 4 milestones')
      .optional(),
    isCompleted: z.boolean().optional().default(false),
  }),
});

export const subgoalValidations = { createSubgoalSchema };
