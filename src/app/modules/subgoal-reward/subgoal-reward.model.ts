import { model, Schema } from 'mongoose';
import { ISubgoalReward } from './subgoal-reward.interface';
import { isURL } from 'validator';

const subgoalRewardSchema = new Schema<ISubgoalReward>({
  // user: {
  //   type: Schema.Types.ObjectId,
  //   required: [true, 'User is required'],
  //   ref: 'User',
  // },
  // subgoal: {
  //   type: Schema.Types.ObjectId,
  //   required: [true, 'Subgoal is required'],
  //   ref: 'Subgoal',
  // },
  name: {
    type: String,
    required: [true, 'Reward name is required'],
    trim: true,
    minlength: [3, 'Reward name must be at least 3 characters long'],
  },
  image: {
    type: String,
    validate: {
      validator: (url: string) => isURL(url),
      message: 'Image must be a valid URL',
    },
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Reward price must be a positive number'],
  },
  link: {
    type: String,
    required: [true, 'Reward link is required'],
    validate: {
      validator: (url: string) => isURL(url),
      message: 'Link must be a valid URL',
    },
  },
  usageCount: {
    type: Number,
    min: [0, 'Usage count must be at least 0'],
    default: 0,
  },
  pointsRequired: {
    type: Number,
    required: [true, 'Points required is required'],
    min: [1, 'Points required must be a positive number'],
  },
  // isRewarded: {
  //   type: Boolean,
  //   default: false,
  // },
});

export const SubgoalReward = model<ISubgoalReward>(
  'SubgoalReward',
  subgoalRewardSchema
);
