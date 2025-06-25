import { Types } from 'mongoose';
import { z } from 'zod';
import { TiptapDocSchema } from './task.validation';

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
  // titap json doc
  description: z.infer<typeof TiptapDocSchema>;
  completedUnits?: number;
  images?: string[];
  deadline: Date;
  isCompleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TaskCreationData = Pick<
  ITask,
  'goal' | 'subgoal' | 'habit' | 'title' | 'description' | 'deadline'
>;

export interface TaskUpdateData {
  newCompletedUnits?: number;
  isCompleted?: true;
}
