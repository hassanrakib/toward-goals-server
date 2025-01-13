import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IHabit, IHabitUnit } from './habit.interface';
import { Habit, HabitUnit } from './habit.model';

const insertHabitUnitIntoDB = async (habitUnit: IHabitUnit) => {
  return HabitUnit.create(habitUnit);
};

const insertHabitIntoDB = async (habit: IHabit) => {
  // check habit unit existence in the db
  const habitUnit = await HabitUnit.findById(habit.unit, '_id');

  if (!habitUnit) {
    throw new AppError(httpStatus.NOT_FOUND, 'Habit unit id is not valid.');
  }

  return Habit.create(habit);
};

export const habitServices = {
  insertHabitUnitIntoDB,
  insertHabitIntoDB,
};
