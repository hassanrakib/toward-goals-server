import { Types } from 'mongoose';

export interface ISubgoalReward {
  name: string;
  image?: string;
  price: number;
  link: string;
}

export interface ISubgoal {
  user: Types.ObjectId;
  goal: Types.ObjectId;
  title: string;
  image?: string;
  duration: number;
  keyMilestones?: string[];
  reward: ISubgoalReward;
  pointsRequired: number;
  isCompleted?: boolean;
  isRewarded?: boolean;
}
