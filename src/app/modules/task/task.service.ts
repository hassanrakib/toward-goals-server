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
  endOfToday,
  isBefore,
  isToday,
  startOfToday,
  startOfYesterday,
} from 'date-fns';
import QueryBuilder, { QueryParams } from '../../builder/QueryBuilder';
import { sanitizeTaskDescription } from './task.util';
import { IHabit } from '../habit/habit.interface';
import { IGoal } from '../goal/goal.interface';
import { getCompletedHabitDifficultyName } from '../habit/habit.util';
import { capitalizeFirstLetter } from '../../utils/capitalize-first-letter';
import { addPathToOperatorOfUpdateObj } from '../../utils/add-path-to-operator-of-update-obj';
import {
  addAnalyticsUpdateToUpdateObj,
  addLevelUpdateToUpdateObj,
} from '../progress/progress.util';
import { calculatePercentage } from '../../utils/calculate-percentage';

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

  // make sure only one task created per day for a goal
  const taskCreatedToday = await Task.findOne(
    {
      goal: task.goal,
      user: userId,
      createdAt: { $gte: startOfToday(), $lte: endOfToday() },
    },
    '_id'
  ).lean();

  if (taskCreatedToday) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'A task is already created for today'
    );
  }

  // make sure all other tasks for this goal are complete
  const incompleteTask = await Task.findOne(
    {
      goal: task.goal,
      user: userId,
      isCompleted: false,
    },
    '_id'
  ).lean();

  if (incompleteTask) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have a task incomplete for the goal'
    );
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

  // if task is already completed, throw an error
  if (task.isCompleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task is already completed');
  }

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
      .lean();

    // if no goalProgress found
    if (!goalProgress) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong!');
    }

    // create an update for goal progress
    const updateForGoalProgress: Record<string, unknown> = {};
    // create an update for habit progress
    const updateForHabitProgress: Record<string, unknown> = {};

    // update goalProgress => totalMiniCompletion, totalPlusCompletion, totalEliteCompletion
    // update habitProgress => miniCompletion, plusCompletion, eliteCompletion, totalUnitCompleted

    // these variables are updated below based on completed difficulty name
    // and used to update goalProgress "analytics.deepFocus"
    let goalProgressTotalMiniCompletion = goalProgress.totalMiniCompletion!;
    let goalProgressTotalPlusCompletion = goalProgress.totalPlusCompletion!;
    let goalProgressTotalEliteCompletion = goalProgress.totalEliteCompletion!;

    // get completed difficulty name => "mini", "plus", "elite"
    // we are sure that completedDificultyName will not be undefined
    // because we already checked that task.completedUnits is not less than task.habit.difficulties.mini
    const completedDifficultyName = getCompletedHabitDifficultyName(
      task.habit.difficulties,
      task.completedUnits!
    )!;

    // update variables above goalProgressTotalXCompletion
    switch (completedDifficultyName) {
      case 'mini':
        goalProgressTotalMiniCompletion += 1;
        break;
      case 'plus':
        goalProgressTotalPlusCompletion += 1;
        break;
      case 'elite':
        goalProgressTotalEliteCompletion += 1;
    }

    // construct the field name to update in goal progress
    const fieldInGoalProgress = `total${capitalizeFirstLetter(completedDifficultyName)}Completion`;
    // construct the field name to update in habit progress
    const fieldInHabitProgress = `${completedDifficultyName}Completion`;

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

    // add task.completedUnits to totalUnitCompleted field of habit progress
    addPathToOperatorOfUpdateObj(
      updateForHabitProgress,
      '$inc',
      'totalUnitCompleted',
      task.completedUnits
    );

    // determine if the deadline is met
    // checking if the task completion time before the deadline
    const isDeadlineMet = isBefore(new Date(), task.deadline);
    // get total deadlines met for tasks
    let totalDeadlinesMet = goalProgress.todosDeadlines!.met;
    let totalDeadlinesMissed = goalProgress.todosDeadlines!.missed;
    if (isDeadlineMet) {
      totalDeadlinesMet += 1;
    } else {
      totalDeadlinesMissed += 1;
    }

    // update goal progress todosDeadlines
    updateForGoalProgress['todosDeadlines.met'] = totalDeadlinesMet;
    updateForGoalProgress['todosDeadlines.missed'] = totalDeadlinesMissed;

    // get total worked days
    // which is updated if streakDates empty [] or last streak date is not today
    let totalWorkedDays = goalProgress.workStreak!.streakDates.length;

    // get total skipped days
    // which is updated if streakDates empty [] or last streak date is before yesterday
    let totalSkippedDays = goalProgress.dayStats!.skippedDays;

    // the variable is used outside the condition below
    // but updated inside the condition
    // percentage of total worked days against totalWorkedDays + totalSkippedDays
    let achievedConsistencyPercentage = calculatePercentage(
      totalWorkedDays,
      totalWorkedDays + totalSkippedDays
    );

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
      // update total worked days to include today
      totalWorkedDays += 1;

      // update workedDays
      updateForGoalProgress['dayStats.workedDays'] = totalWorkedDays;

      // push today's date as the last streak date
      addPathToOperatorOfUpdateObj(
        updateForGoalProgress,
        '$push',
        'workStreak.streakDates',
        new Date().toISOString()
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

        // update skippedDays
        // get total days passed from the goal start date to now
        // include today
        const totalDaysPassedIncludingToday =
          differenceInDays(new Date(), goalProgress.goal.startDate) + 1;

        // update totalSkippedDays variable
        totalSkippedDays = totalDaysPassedIncludingToday - totalWorkedDays;

        updateForGoalProgress['dayStats.skippedDays'] = totalSkippedDays;
      } else {
        // increment current work streak
        // as last streak date is yesterday
        addPathToOperatorOfUpdateObj(
          updateForGoalProgress,
          '$inc',
          'workStreak.current',
          1
        );
      }

      // update goalProgress "analytics.consistency"
      // inside the condition because
      // the function is dependent on totalWorkedDays & totalSkippedDays
      // and totalWorkedDays, totalSkippedDays changes inside the condition
      const [newAchievedConsistency] = await addAnalyticsUpdateToUpdateObj(
        updateForGoalProgress,
        totalWorkedDays,
        totalSkippedDays,
        'consistency'
      );

      // update achievedConsistencyPercentage
      achievedConsistencyPercentage = newAchievedConsistency;
    }

    // update goalProgress "analytics.commitment"
    const [achievedCommitmentPercentage] = await addAnalyticsUpdateToUpdateObj(
      updateForGoalProgress,
      totalDeadlinesMet,
      totalDeadlinesMissed,
      'commitment'
    );

    // update goalProgress "analytics.deepFocus"
    const [achievedDeepFocusPercentage] = await addAnalyticsUpdateToUpdateObj(
      updateForGoalProgress,
      goalProgressTotalPlusCompletion + goalProgressTotalEliteCompletion,
      goalProgressTotalMiniCompletion,
      'deepFocus'
    );

    // update goalProgress "level"
    await addLevelUpdateToUpdateObj(
      updateForGoalProgress,
      achievedConsistencyPercentage,
      achievedCommitmentPercentage,
      achievedDeepFocusPercentage
    );

    // finally do the update operations

    // update task's habit progress
    await HabitProgress.findOneAndUpdate(
      {
        habit: task.habit,
        user: task.user,
      },
      updateForHabitProgress
    );

    // update task's goal progress
    await GoalProgress.findOneAndUpdate(
      { goal: task.goal, user: task.user },
      updateForGoalProgress
    );
  }

  // update to the task
  const update = {
    isCompleted: taskUpdateData.isCompleted ?? false,
    $inc: { completedUnits: taskUpdateData.newCompletedUnits ?? 0 },
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
