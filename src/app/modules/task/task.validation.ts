import { isAfter, isBefore, isToday } from 'date-fns';
import { isMongoId } from 'validator';
import { z } from 'zod';

const createTimeSpanSchema = z.object({
  body: z
    .object({
      task: z
        .string({ required_error: 'Task is required' })
        .refine((id) => isMongoId(id), {
          message: 'Task is not valid',
        }),
      startTime: z
        .string({ required_error: 'Start time is required' })
        .datetime(),
      endTime: z.string({ required_error: 'End time is required' }).datetime(),
    })
    .refine(
      (data) => {
        return isAfter(new Date(data.endTime), new Date(data.startTime));
      },
      {
        message: 'End time must be after the start time',
        path: ['endTime'],
      }
    )
    .refine(
      (data) => {
        return isBefore(new Date(data.endTime), new Date());
      },
      {
        message: 'End time can not be in future',
        path: ['endTime'],
      }
    ),
});

const createTaskSchema = z.object({
  body: z.object({
    // user: z
    //   .string({ required_error: 'User is required.' })
    //   .refine((id) => isMongoId(id), {
    //     message: 'User is not valid',
    //   }),
    goal: z
      .string({ required_error: 'Goal is required.' })
      .refine((id) => isMongoId(id), {
        message: 'Goal is not valid',
      }),
    subgoal: z
      .string({ required_error: 'Subgoal is required.' })
      .refine((id) => isMongoId(id), {
        message: 'Subgoal is not valid',
      }),
    habit: z
      .string({ required_error: 'Habit is required.' })
      .refine((id) => isMongoId(id), {
        message: 'Habit is not valid',
      }),
    title: z
      .string({ required_error: 'Title is required' })
      .min(5, { message: 'Title must be at least 5 characters long' })
      .max(50, { message: 'Title cannot exceed 50 characters' }),
    description: z.string({ required_error: 'Task description is required' }),
    // completedUnits: z
    //   .number()
    //   .int('Completed units must be an integer.')
    //   .min(0, 'Completed units cannot be less than 0.')
    //   .optional()
    //   .default(0),
    // milestones: z
    //   .array(
    //     z.string().min(3, 'Each milestone must be at least 3 characters long')
    //   )
    //   .min(2, 'There must be at least 2 milestones')
    //   .max(4, 'There must be no more than 4 milestones')
    //   .optional(),
    deadline: z
      .string({ required_error: 'Deadline is required' })
      .datetime()
      .refine((date) => isAfter(new Date(date), new Date()), {
        message: 'Deadline must be in the future.',
      })
      .refine((date) => isToday(new Date(date)), {
        message: 'Deadline must not exceed today.',
      }),
    // isCompleted: z.boolean().optional().default(false),
  }),
});

const updateTaskSchema = z.object({
  completedUnits: z
    .number()
    .int('Completed units must be an integer.')
    .min(0, 'Completed units cannot be less than 1.')
    .optional(),
});

export const taskValidations = {
  createTimeSpanSchema,
  createTaskSchema,
  updateTaskSchema,
};
