import { Types } from 'mongoose';

export interface ISubgoalProgress {
  user: Types.ObjectId;
  goal: Types.ObjectId;
  subgoal: Types.ObjectId;
  keyMilestones?: string[];
  reward?: Types.ObjectId;
  isCompleted?: boolean;
  isRewarded?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type SubgoalProgressCreationData = Pick<
  ISubgoalProgress,
  'goal' | 'subgoal'
>;

export type SubgoalProgressUpdateData = Partial<
  Pick<ISubgoalProgress, 'isCompleted' | 'keyMilestones'>
>;

export interface IHabitProgress {
  user: Types.ObjectId;
  goal: Types.ObjectId;
  habit: Types.ObjectId;
  totalUnitCompleted?: number;
  miniCompletion?: number;
  plusCompletion?: number;
  eliteCompletion?: number;
}

export type HabitProgressCreationData = Pick<IHabitProgress, 'goal' | 'habit'>;

export interface IGoalProgress {
  user: Types.ObjectId;
  goal: Types.ObjectId;
  level: Types.ObjectId;
  points?: number;
  totalMiniCompletion?: number;
  totalPlusCompletion?: number;
  totalEliteCompletion?: number;
  workStreak?: { current: number; streakDates: Date[] };
  dayStats?: { skippedDays: number; workedDays: number };
  todosDeadlines?: { missed: number; met: number };
  analytics: {
    consistency: { percent?: number; level: Types.ObjectId };
    deepFocus: { percent?: number; level: Types.ObjectId };
    commitment: { percent?: number; level: Types.ObjectId };
  };
  isCompleted?: boolean;
}

export type GoalProgressCreationData = Pick<IGoalProgress, 'goal'>;
export interface GoalProgressUpdateData {
  isCompleted: true;
}
