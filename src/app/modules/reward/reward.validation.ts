import { z } from 'zod';

const createRewardSchema = z.object({
  body: z.object({
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
    usageCount: z
      .number()
      .int({ message: 'User count must be integer' })
      .min(0, { message: 'Usage count must be atleast 0' })
      .optional(),
  }),
});

export const rewardValidations = { createRewardSchema };
