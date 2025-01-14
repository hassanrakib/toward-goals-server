import { Request } from 'express';
import catchAsync from '../../utils/catch-async';
import { habitServices } from './habit.service';
import { IHabit, IHabitUnit } from './habit.interface';
import sendResponse from '../../utils/send-response';
import httpStatus from 'http-status';

const createHabitUnit = catchAsync(
  async (req: Request<{ goalId?: string }, {}, IHabitUnit>, res) => {
    const habitUnit = await habitServices.insertHabitUnitIntoDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Habit creation successful',
      data: habitUnit,
    });
  }
);

const createHabit = catchAsync(async (req: Request<{}, {}, IHabit>, res) => {
  const habit = await habitServices.insertHabitIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Habit creation successful',
    data: habit,
  });
});

export const habitControllers = {
  createHabitUnit,
  createHabit,
};
