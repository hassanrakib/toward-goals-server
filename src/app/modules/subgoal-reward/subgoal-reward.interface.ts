// import { Types } from 'mongoose';

export interface ISubgoalReward {
  // user: Types.ObjectId;
  // subgoal: Types.ObjectId;
  name: string;
  image?: string;
  price: number;
  link: string;
  usageCount?: number;
  pointsRequired: number;
  // isRewarded?: boolean;
}

export type ISubgoalRewardFromClient = Omit<ISubgoalReward, 'pointsRequired'>;
