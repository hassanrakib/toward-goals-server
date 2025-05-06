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
  // html string
  description: string;
  completedUnits?: number;
  images?: string[];
  deadline: Date;
  isCompleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TaskCreationData = Pick<
  ITask,
  'goal' | 'subgoal' | 'habit' | 'description' | 'deadline'
> & { title: string };

export interface TaskUpdateData {
  newCompletedUnits?: number;
  isCompleted?: true;
}
