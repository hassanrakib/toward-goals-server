import { isMongoId } from 'validator';
import { z } from 'zod';
import { HabitUnitNameForTime, HabitUnitType } from './habit.interface';

const createHabitUnitSchema = z.object({
  body: z
    .object({
      type: z.enum([HabitUnitType.Custom, HabitUnitType.Time], {
        errorMap: () => ({
          message: `Type must be ${HabitUnitType.Custom} or ${HabitUnitType.Time}`,
        }),
      }),
      name: z
        .string({
          required_error: 'Unit name is required.',
        })
        .min(2, 'Habit unit name must 2 characters long')
        .max(8, 'Habit unit name must be at most 8 characters long')
        .trim(),
      // usageCount: z
      //   .number()
      //   .min(0, 'Usage count must be at least 0')
      //   .optional()
      //   .default(0),
    })
    .refine(
      (data) => {
        if (data.type === HabitUnitType.Time) {
          return Object.values(HabitUnitNameForTime).includes(
            data.name as HabitUnitNameForTime
          );
        }
        return true;
      },
      {
        message: `Unit name must be ${HabitUnitNameForTime.Minute} or ${HabitUnitNameForTime.Hour} if the unit type is Time`,
        path: ['name'],
      }
    ),
});

const createHabitDifficultiesSchema = z
  .object({
    mini: z
      .number({
        required_error: 'Mini difficulty level is required.',
      })
      .min(1, 'Mini difficulty must be at least 1.'),
    plus: z
      .number({
        required_error: 'Plus difficulty level is required.',
      })
      .min(2, 'Plus difficulty must be at least 2.'),
    elite: z
      .number({
        required_error: 'Elite difficulty level is required.',
      })
      .min(3, 'Elite difficulty must be at least 3.'),
  })
  .refine((data) => data.plus > data.mini, {
    message: 'Plus difficulty must be greater than mini difficulty',
    path: ['plus'],
  })
  .refine((data) => data.elite > data.plus, {
    message: 'Elite difficulty must be greater than Plus difficulty.',
    path: ['elite'],
  });

const createHabitSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Habit title is required.',
      })
      .min(3, 'Habit title must be at least 3 characters long.')
      .max(60, 'Habit title can be at most 60 characters long.'),
    unit: z
      .string({
        required_error: 'Habit unit is required.',
      })
      .refine((unitId) => isMongoId(unitId), {
        message: 'Unit id is not valid',
      }),
    difficulties: createHabitDifficultiesSchema,
    // usageCount: z
    //   .number()
    //   .min(0, 'Usage count must be at least 0.')
    //   .optional()
    //   .default(0),
  }),
});

export const habitValidations = {
  createHabitSchema,
  createHabitUnitSchema,
};
