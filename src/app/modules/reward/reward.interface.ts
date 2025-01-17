export interface IReward {
  name: string;
  image?: string;
  price: number;
  link: string;
  usageCount?: number;
  pointsRequired: number;
}

export type RewardCreationData = Pick<IReward, 'name' | 'price' | 'link'>;
