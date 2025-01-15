import { Types } from 'mongoose';

export interface ITimeSpan {
  task: Types.ObjectId;
  startTime: Date;
  endTime: Date;
}

export interface ITask {
  user: Types.ObjectId;
  goal: Types.ObjectId;
  subgoal: Types.ObjectId;
  habit: Types.ObjectId;
  title: string;
  completedUnits?: number;
  milestones?: string[];
  images?: string[];
  deadline: Date;
  isCompleted?: boolean;
}
