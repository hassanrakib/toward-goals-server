import { Request } from 'express';
import catchAsync from '../../utils/catch-async';
import { habitServices } from './habit.service';
import { HabitCreationData, HabitUnitCreationData } from './habit.interface';
import sendResponse from '../../utils/send-response';
import httpStatus from 'http-status';

const createHabitUnit = catchAsync(
  async (req: Request<{ goalId?: string }, {}, HabitUnitCreationData>, res) => {
    const habitUnit = await habitServices.insertHabitUnitIntoDB(
      req.params.goalId!,
      req.user.username,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Habit creation successful',
      data: habitUnit,
    });
  }
);

const createHabit = catchAsync(
  async (req: Request<{ goalId?: string }, {}, HabitCreationData>, res) => {
    const habit = await habitServices.insertHabitIntoDB(
      req.params.goalId!,
      req.user.username,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Habit creation successful',
      data: habit,
    });
  }
);

const getHabitsOfAGoal = catchAsync(
  async (req: Request<{ goalId?: string }>, res) => {
    const habits = await habitServices.fetchHabitsOfAGoal(
      req.params.goalId!,
      req.user.username
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Habits are retrieved successful',
      data: habits,
    });
  }
);

export const habitControllers = {
  createHabitUnit,
  createHabit,
  getHabitsOfAGoal,
};
