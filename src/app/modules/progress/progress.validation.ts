import { isMongoId } from 'validator';
import { z } from 'zod';

const createSubgoalProgressSchema = z.object({
  body: z.object({
    goal: z
      .string({
        required_error: 'Goal is required',
      })
      .refine((id) => isMongoId(id), {
        message: 'Goal id is not valid',
      }),
    subgoal: z
      .string({
        required_error: 'Subgoal is required',
      })
      .refine((id) => isMongoId(id), {
        message: 'Subgoal id is not valid',
      }),
    keyMilestones: z
      .array(
        z.string().min(3, 'Each milestone must be at least 3 characters long')
      )
      .min(2, 'There must be at least 2 milestones')
      .max(4, 'There must be no more than 4 milestones')
      .optional(),
    reward: z
      .string()
      .refine((id) => isMongoId(id), {
        message: 'Reward id is not valid',
      })
      .optional(),
    isCompleted: z.boolean().optional().default(false),
    isRewarded: z.boolean().optional(),
  }),
});

const createHabitProgressSchema = z.object({
  body: z.object({
    goal: z
      .string({
        required_error: 'Goal is required',
      })
      .refine((id) => isMongoId(id), {
        message: 'Goal id is not valid',
      }),
    habit: z
      .string({
        required_error: 'Habit is required',
      })
      .refine((id) => isMongoId(id), {
        message: 'Habit id is not valid',
      }),
    totalUnitCompleted: z
      .number()
      .int('Total completed unit must be an integer')
      .min(0, 'Total completed unit must be a non-negative number')
      .optional()
      .default(0),
    miniCompletion: z
      .number()
      .int('Mini completion must be an integer')
      .min(0, 'Mini completion must be a non-negative number')
      .optional()
      .default(0),
    plusCompletion: z
      .number()
      .int('Plus completion must be an integer')
      .min(0, 'Plus completion must be a non-negative number')
      .optional()
      .default(0),
    eliteCompletion: z
      .number()
      .int('Elite completion must be an integer')
      .min(0, 'Elite completion must be a non-negative number')
      .optional()
      .default(0),
  }),
});

const createProgressSchema = z.object({
  body: z.object({
    goal: z
      .string({
        required_error: 'Goal is required',
      })
      .refine((id) => isMongoId(id), {
        message: 'Goal id is not valid',
      }),
    level: z
      .string({
        required_error: 'Level is required',
      })
      .refine((id) => isMongoId(id), {
        message: 'Level id is not valid',
      }),
    points: z
      .number()
      .int('Points must be an integer')
      .min(0, 'Points must be a non-negative number')
      .optional()
      .default(0),
    totalMiniCompletion: z
      .number()
      .int('Total mini completion must be an integer')
      .min(0, 'Total mini completion must be a non-negative number')
      .optional()
      .default(0),
    totalPlusCompletion: z
      .number()
      .int('Total plus completion must be an integer')
      .min(0, 'Total plus completion must be a non-negative number')
      .optional()
      .default(0),
    totalEliteCompletion: z
      .number()
      .int('Total elite completion must be an integer')
      .min(0, 'Total elite completion must be a non-negative number')
      .optional()
      .default(0),
    workStreak: z
      .object({
        current: z
          .number({ required_error: 'Current work streak is required' })
          .int('Current work streak must be an integer')
          .min(0, 'Current work streak must be a non-negative number'),
        total: z
          .number({ required_error: 'Total work streak is required' })
          .int('Total work streak must be an integer')
          .min(0, 'Total work streak must be a non-negative number'),
      })
      .optional()
      .default({ current: 0, total: 0 }),
    skippedDays: z
      .number()
      .int('Skipped days must be an integer')
      .min(0, 'Skipped days must be a non-negative number')
      .optional()
      .default(0),
    todosDeadlines: z
      .object({
        missed: z
          .number({ required_error: 'Missed deadlines is required' })
          .int('Missed deadlines must be an integer')
          .min(0, 'Missed deadlines must be a non-negative number'),
        met: z
          .number({ required_error: 'Met deadlines is required' })
          .int('Met deadlines must be an integer')
          .min(0, 'Met deadlines must be a non-negative number'),
      })
      .optional()
      .default({ missed: 0, met: 0 }),
    analytics: z.object({
      consistency: z.object({
        percent: z
          .number()
          .min(0, 'Consistency percentage must be at least 0')
          .max(100, 'Consistency percentage cannot exceed 100')
          .default(0),

        level: z
          .string({ required_error: 'Consistency level ID is required' })
          .refine((id) => isMongoId(id), {
            message: 'Consistency level id is not valid',
          }),
      }),
      deepFocus: z.object({
        percent: z
          .number()
          .min(0, 'Deep focus percentage must be at least 0')
          .max(100, 'Deep focus percentage cannot exceed 100')
          .default(0),

        level: z
          .string({ required_error: 'Deep focus level ID is required' })
          .refine((id) => isMongoId(id), {
            message: 'Deep focus level id is not valid',
          }),
      }),
      commitment: z.object({
        percent: z
          .number()
          .min(0, 'Commitment percentage must be at least 0')
          .max(100, 'Commitment percentage cannot exceed 100')
          .default(0),

        level: z
          .string({ required_error: 'Commitment level ID is required' })
          .refine((id) => isMongoId(id), {
            message: 'Commitment level id is not valid',
          }),
      }),
    }),
  }),
});

export const progressValidations = {
  createSubgoalProgressSchema,
  createHabitProgressSchema,
  createProgressSchema,
};
