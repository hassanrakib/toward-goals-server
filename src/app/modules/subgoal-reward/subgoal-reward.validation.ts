import { isMongoId } from 'validator';
import { z } from 'zod';

const createSubgoalRewardSchema = z.object({
  body: z.object({
    subgoal: z
      .string({ required_error: 'Subgoal is required' })
      .refine((id) => isMongoId(id), {
        message: 'Subgoal id is not valid',
      }),
    name: z
      .string({ required_error: 'Reward name is required' })
      .trim()
      .min(3, 'Reward name must be at least 3 characters long'),
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
    isRewarded: z.boolean().optional().default(false),
  }),
});

export const subgoalRewardValidations = { createSubgoalRewardSchema };
