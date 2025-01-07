import { Types } from 'mongoose';

export interface ISubgoalReward {
  user: Types.ObjectId;
  subgoal: Types.ObjectId;
  name: string;
  image?: string;
  price: number;
  link: string;
  pointsRequired: number;
  isRewarded?: boolean;
}

export type ISubgoalRewardFromClient = Omit<
  ISubgoalReward,
  'pointsRequired' | 'user'
>;
