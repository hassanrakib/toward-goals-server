import { model, Schema } from 'mongoose';
import { IGoal } from './goal.interface';
import isURL from 'validator/es/lib/isURL';

const goalSchema = new Schema<IGoal>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [50, 'Title cannot exceed 50 characters'],
    },
    image: {
      type: String,
      validate: {
        validator: (url: string) => isURL(url),
        message: 'Invalid image URL',
      },
      default: '',
    },
    creator: {
      type: Schema.Types.ObjectId,
      required: [true, 'Creator is required'],
      ref: 'User',
    },
    admins: {
      type: [Schema.Types.ObjectId],
      default: [],
      ref: 'User',
      validate: {
        validator: (admins: Schema.Types.ObjectId[]) => admins.length <= 5,
        message: 'Admins list exceeds the maximum allowed number',
      },
    },
    users: {
      type: [Schema.Types.ObjectId],
      required: [true, 'Users field is required'],
      ref: 'User',
      default: [],
      validate: {
        validator: (users: Schema.Types.ObjectId[]) => users.length <= 200,
        message: 'User list exceeds the maximum allowed number.',
      },
    },
    userLimit: {
      type: Number,
      required: [true, 'User limit is required'],
      min: [1, 'User limit must be at least 1'],
      max: [200, 'User limit cannot exceed 200'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      validate: {
        validator: (date: Date) => date > new Date(),
        message: 'Start date must be in the future.',
      },
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 7,
      max: 365 * 5, // 5 years
    },
  },
  {
    timestamps: true,
  }
);

export const Goal = model<IGoal>('Goal', goalSchema);