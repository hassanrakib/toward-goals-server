import { Types } from 'mongoose';

export interface ISubgoalProgress {
  user: Types.ObjectId;
  goal: Types.ObjectId;
  subgoal: Types.ObjectId;
  keyMilestones?: string[];
  reward: Types.ObjectId;
  isCompleted?: boolean;
  isRewarded?: boolean;
}

export interface IHabitProgress {
  user: Types.ObjectId;
  goal: Types.ObjectId;
  habit: Types.ObjectId;
  totalUnitCompleted?: number;
  miniCompletion?: number;
  plusCompletion?: number;
  eliteCompletion?: number;
}

export interface IProgress {
  user: Types.ObjectId;
  goal: Types.ObjectId;
  level: Types.ObjectId;
  points?: number;
  totalMiniCompletion?: number;
  totalPlusCompletion?: number;
  totalEliteCompletion?: number;
  workStreak?: { current: number; total: number };
  skippedDays?: number;
  todosDeadlines?: { missed: number; met: number };
  analytics: {
    consistency: { percent?: number; level: Types.ObjectId };
    deepFocus: { percent?: number; level: Types.ObjectId };
    commitment: { percent?: number; level: Types.ObjectId };
  };
  isCompleted?: boolean;
}
