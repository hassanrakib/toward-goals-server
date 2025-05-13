import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import {
  ITask,
  ITimeSpan,
  TaskCreationData,
  TaskUpdateData,
} from './task.interface';
import { Task, TimeSpan } from './task.model';
import { User } from '../user/user.model';
import {
  HabitProgress,
  GoalProgress,
  SubgoalProgress,
} from '../progress/progress.model';
import saveImageToCloud from '../../utils/save-image-to-cloud';
import {
  differenceInDays,
  isBefore,
  isToday,
  startOfDay,
  startOfYesterday,
} from 'date-fns';
import QueryBuilder, { QueryParams } from '../../builder/QueryBuilder';
import {
  addPathToOperatorOfUpdateObj,
  capitalizeFirstLetter,
  getCompletedHabitDifficultyName,
  sanitizeTaskDescription,
} from './task.util';
import { IHabit } from '../habit/habit.interface';
import { IGoal } from '../goal/goal.interface';

const insertTimeSpanIntoDB = async (
  userUsername: string,
  timeSpan: ITimeSpan
) => {
  // get the user _id to use it in the task finding
  // to make sure task belongs the this person
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // check if provided taskId really exist in the db
  // and make sure this task belongs the this person
  const task = await Task.findOne(
    { _id: timeSpan.task, user: userId },
    '_id isCompleted createdAt'
  ).lean();

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task is not valid');
  }
  // don't allow new time span if the task is already complete
  if (task.isCompleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task is already completed');
  }

  // make sure that the timespan's startTime is after the task creation time
  if (isBefore(new Date(timeSpan.startTime), new Date(task.createdAt!))) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Timespan start time can not be before the task creation time'
    );
  }

  return TimeSpan.create(timeSpan);
};

const insertTaskIntoDB = async (
  userUsername: string,
  task: TaskCreationData,
  taskImageFiles: Express.Multer.File[] | undefined
) => {
  // get the user _id to use it in the task creation
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // don't allow creating task when progress for the goal is not found
  // also, don't allow if the goal progress tells that the user already completed the goal
  const progress = await GoalProgress.findOne(
    { goal: task.goal, user: userId },
    '_id isCompleted'
  ).lean();

  if (!progress) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not into this goal');
  }

  if (progress.isCompleted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already completed the goal'
    );
  }

  // subgoal progress is allowed to create after the goal's startDate
  // don't allow creating task when subgoal progress for the subgoal is not found
  // also, don't allow if the subgoal progress tells that the user already completed the subgoal
  const subgoalProgress = await SubgoalProgress.findOne(
    {
      user: userId,
      subgoal: task.subgoal,
    },
    '_id isCompleted'
  ).lean();

  if (!subgoalProgress) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not into this subgoal');
  }

  if (subgoalProgress.isCompleted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not add a task as the subgoal is already completed'
    );
  }

  // don't allow creating task when habit progress for the habit is not found
  const habitProgress = await HabitProgress.findOne(
    { habit: task.habit, user: userId },
    '_id'
  ).lean();

  if (!habitProgress) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not into the habit');
  }

  // make sure all other tasks for this goal, subgoal & habit are complete
  const incompleteTask = await Task.findOne(
    {
      goal: task.goal,
      subgoal: task.subgoal,
      habit: task.habit,
      isCompleted: false,
    },
    '_id'
  ).lean();

  if (incompleteTask) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You have a task incomplete');
  }
  // new task
  const newTask: ITask = {
    ...task,
    // santize will santize the html
    // to remove dangerous scripts, event handlers, etc from html
    description: sanitizeTaskDescription(task.description),
    user: userId,
  };

  // upload task images, if sent from the client side
  if (taskImageFiles?.length) {
    // as the images are sent
    newTask.images = [];
    for (const taskImageFile of taskImageFiles) {
      const uniqueSuffix = `${String(Date.now())}-${String(Math.round(Math.random() * 1e9))}`;
      const imageName = `${task.title.split(' ').join('-').toLowerCase()}-by-${userUsername}-${uniqueSuffix}`;
      const taskImageURL = await saveImageToCloud(
        imageName,
        taskImageFile.path,
        `toward-goals/tasks/${userUsername}`
      );

      newTask.images.push(taskImageURL);
    }
  }

  return Task.create(newTask);
};

const fetchMyTasksFromDB = async (userUsername: string, query: QueryParams) => {
  // get the user _id to use it in the query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  const tasksQuery = new QueryBuilder(Task.find({ user: userId }), query)
    .filter()
    .sort()
    .selectFields()
    .paginate();

  const tasks = await tasksQuery.modelQuery
    .populate({
      path: 'habit',
      populate: {
        path: 'unit',
      },
    })
    // populating user field and selecting only the username of the user
    .populate('user', 'username');

  const meta = await tasksQuery.getPaginationInformation();

  return {
    tasks,
    meta,
  };
};

const fetchTaskTimeSpans = async (taskId: string) => {
  // check whether taskId is valid
  const task = await Task.findById(taskId, '_id').lean();

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task is not found!');
  }

  return TimeSpan.find({ task: taskId });
};

const updateTaskById = async (
  taskId: string,
  taskUpdateData: TaskUpdateData
) => {
  // check whether taskId is valid
  const task = await Task.findById(taskId)
    // populate with 'paths' generic
    .populate<{ habit: IHabit }>('habit')
    .lean();

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task is not found!');
  }

  // create an update for goal progress
  const updateForGoalProgress: Record<string, unknown> = {};

  // if taskUpdateData has isCompleted: true
  if (taskUpdateData.isCompleted) {
    // check at least mini version of the selected habit completed
    if (task.completedUnits! < task.habit.difficulties.mini) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Must complete the mini version of the habit'
      );
    }

    // get the task's goal progress
    const goalProgress = await GoalProgress.findOne({
      goal: task.goal,
      user: task.user,
    })
      .populate<{ goal: IGoal }>('goal', 'startDate')
      .select(['goal', 'workStreak', 'dayStats'])
      .lean();

    // if no goalProgress found
    if (!goalProgress) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong!');
    }

    // if streakDates empty []
    // if last streak date is not today
    if (
      !goalProgress.workStreak?.streakDates.length ||
      !isToday(
        goalProgress.workStreak.streakDates[
          goalProgress.workStreak.streakDates.length - 1
        ]
      )
    ) {
      // push today's date as the last streak date
      addPathToOperatorOfUpdateObj(
        updateForGoalProgress,
        '$push',
        'workStreak.streakDates',
        new Date().toISOString()
      );

      // increment workedDays
      addPathToOperatorOfUpdateObj(
        updateForGoalProgress,
        '$inc',
        'dayStats.workedDays',
        1
      );

      // if streakDates [] or
      // if last streak is before yesterday
      if (
        !goalProgress.workStreak?.streakDates.length ||
        isBefore(
          goalProgress.workStreak.streakDates[
            goalProgress.workStreak.streakDates.length - 1
          ],
          startOfYesterday()
        )
      ) {
        // reset the current streak to 1
        updateForGoalProgress['workStreak.current'] = 1;

        // add days to skipped days
        // add 1, as differenceInDays doesn't include start date
        const totalDaysFromGoalStartDateToYesterday =
          differenceInDays(
            startOfYesterday(),
            startOfDay(goalProgress.goal.startDate)
          ) + 1;

        // if goal.startDate is today
        // then, startOfDay(today) is greater than startOfYesterday()
        // but when in differenceInDays(endDate, startDate) startDate is greater
        // than endDate, the function returns negative value
        if (totalDaysFromGoalStartDateToYesterday > 0) {
          updateForGoalProgress['dayStats.skippedDays'] =
            totalDaysFromGoalStartDateToYesterday -
            // add 1 to worked days to include today
            (goalProgress.dayStats!.workedDays + 1);
        }
      } else {
        // increment current work streak
        addPathToOperatorOfUpdateObj(
          updateForGoalProgress,
          '$inc',
          'workStreak.current',
          1
        );
      }
    }

    // update goal progress todosDeadlines
    // if the task completion time before the deadline
    if (isBefore(new Date(), task.deadline)) {
      // increment "todosDeadlines.met" by 1
      addPathToOperatorOfUpdateObj(
        updateForGoalProgress,
        '$inc',
        'todosDeadlines.met',
        1
      );
    } else {
      // increment "todosDeadlines.missed" by 1
      addPathToOperatorOfUpdateObj(
        updateForGoalProgress,
        '$inc',
        'todosDeadlines.missed',
        1
      );
    }
  }

  // if taskUpdateData.newCompletedUnits found
  // then also it has to be greater than 0, because 0 is falsy
  let totalCompletedUnits: number | undefined;
  if (taskUpdateData.newCompletedUnits) {
    // calculate total completed units
    totalCompletedUnits =
      task.completedUnits! + taskUpdateData.newCompletedUnits;

    // get the previous completed difficulty
    const prevCompletedDifficultyName = getCompletedHabitDifficultyName(
      task.habit.difficulties,
      task.completedUnits!
    );

    // currently completed difficulty name
    const newCompletedDifficultyName = getCompletedHabitDifficultyName(
      task.habit.difficulties,
      totalCompletedUnits
    );

    // create an update for habit progress
    const updateForHabitProgress: Record<string, unknown> = {};

    // if new completed habit difficulty is different than prev completed difficulty
    if (prevCompletedDifficultyName !== newCompletedDifficultyName) {
      // if prevCompletedDifficultyName is found
      if (prevCompletedDifficultyName) {
        // construct the field name of goal progress
        const fieldInGoalProgress = `total${capitalizeFirstLetter(prevCompletedDifficultyName)}Completion`;
        // construct the field name of habit progress
        const fieldInHabitProgress = `${prevCompletedDifficultyName}Completion`;

        // decrement the field value by 1 in goal progress
        addPathToOperatorOfUpdateObj(
          updateForGoalProgress,
          '$inc',
          fieldInGoalProgress,
          -1
        );
        // decrement the field value by 1 in habit progress
        addPathToOperatorOfUpdateObj(
          updateForHabitProgress,
          '$inc',
          fieldInHabitProgress,
          -1
        );
      }

      // if newCompletedDifficultyName is found
      if (newCompletedDifficultyName) {
        // construct the field name of goal progress
        const fieldInGoalProgress = `total${capitalizeFirstLetter(newCompletedDifficultyName)}Completion`;
        // construct the field name of habit progress
        const fieldInHabitProgress = `${newCompletedDifficultyName}Completion`;

        // and increment the field value by 1 in goal progress
        addPathToOperatorOfUpdateObj(
          updateForGoalProgress,
          '$inc',
          fieldInGoalProgress,
          1
        );
        // and increment the field value by 1 in habit progress
        addPathToOperatorOfUpdateObj(
          updateForHabitProgress,
          '$inc',
          fieldInHabitProgress,
          1
        );
      }
    }

    // add newCompletedUnits to totalUnitCompleted
    addPathToOperatorOfUpdateObj(
      updateForHabitProgress,
      '$inc',
      'totalUnitCompleted',
      taskUpdateData.newCompletedUnits
    );

    // update user task habit progress
    await HabitProgress.findOneAndUpdate(
      {
        habit: task.habit,
        user: task.user,
      },
      updateForHabitProgress
    );
  }

  // if update available for goal progress
  if (Object.keys(updateForGoalProgress).length) {
    // update user task goal progress
    await GoalProgress.findOneAndUpdate(
      { goal: task.goal, user: task.user },
      updateForGoalProgress
    );
  }

  // update to the task
  const update = {
    // if any of the fields value is undefined
    // mongoose will opt that field out of the update operation
    isCompleted: taskUpdateData.isCompleted,
    completedUnits: totalCompletedUnits,
  };

  const result = await Task.findByIdAndUpdate(taskId, update, {
    new: true,
    runValidators: true,
  });

  return result;
};

export const taskServices = {
  insertTimeSpanIntoDB,
  insertTaskIntoDB,
  fetchMyTasksFromDB,
  fetchTaskTimeSpans,
  updateTaskById,
};
