import { Types } from 'mongoose';

export interface IGoal {
  title: string;
  image?: string;
  creator: Types.ObjectId;
  admins?: Types.ObjectId[];
  users: Types.ObjectId[];
  userLimit: number;
  startDate: Date;
  duration: number;
}

export type GoalCreationData = Pick<
  IGoal,
  'title' | 'userLimit' | 'startDate' | 'duration'
>;
