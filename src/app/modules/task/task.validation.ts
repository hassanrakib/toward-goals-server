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

// Tiptap JSON document validation
// Text node schema
const TextNodeSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
});

// Mention node schema
const MentionNodeSchema = z.object({
  type: z.enum(['goal', 'subgoal', 'habit', 'deadline']),
  attrs: z.object({
    id: z.string(),
    label: z.string(),
  }),
});

// Paragraph node schema: can have text or mention nodes
export const ParagraphNodeSchema = z.object({
  type: z.literal('paragraph'),
  content: z.array(z.union([TextNodeSchema, MentionNodeSchema])),
});

// Document schema: must have exactly one paragraph
export const TiptapDocSchema = z.object({
  type: z.literal('doc'),
  content: z.tuple([ParagraphNodeSchema]),
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
      .max(60, { message: 'Title cannot exceed 60 characters' }),
    description: TiptapDocSchema,
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
  body: z.object({
    newCompletedUnits: z
      .number()
      .int('New completed units must be an integer.')
      .min(1, 'New completed units cannot be less than 1.')
      .optional(),
    isCompleted: z.literal(true).optional(),
  }),
});

export const taskValidations = {
  createTimeSpanSchema,
  createTaskSchema,
  updateTaskSchema,
};
