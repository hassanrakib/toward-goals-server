export interface IReward {
  name: string;
  image?: string;
  price: number;
  link: string;
  usageCount?: number;
  pointsRequired: number;
}

export type RewardFromClient = Omit<IReward, 'pointsRequired'>;
