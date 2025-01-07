import { Types } from 'mongoose';

export interface ISubgoal {
  user: Types.ObjectId;
  goal: Types.ObjectId;
  title: string;
  duration: number;
  keyMilestones?: string[];
  isCompleted?: boolean;
}

export type ISubgoalFromClient = Omit<ISubgoal, 'user'>;
