import { isMongoId } from 'validator';
import { z } from 'zod';

const createSubgoalRewardSchema = z.object({
  name: z
    .string({ required_error: 'Reward name is required' })
    .trim()
    .min(3, 'Reward name must be at least 3 characters long'),
  image: z.string().url('Image must be a valid URL').optional(),
  price: z
    .number({
      required_error: 'Reward price is required',
    })
    .min(1, 'Reward price must be a positive number'),
  link: z
    .string({
      required_error: 'Reward link is required',
    })
    .url('Reward link must be a valid URL'),
});

const createSubgoalSchema = z.object({
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
    .optional()
    .default([]),
  reward: createSubgoalRewardSchema,
  isRewarded: z.boolean().optional().default(false),
  isCompleted: z.boolean().optional().default(false),
});

export const subgoalValidations = { createSubgoalSchema };
