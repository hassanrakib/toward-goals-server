import { CallbackError, model, Schema } from 'mongoose';
import { IUser } from './user.interface';
import isStrongPassword from 'validator/es/lib/isStrongPassword';
import isEmail from 'validator/es/lib/isEmail';
import isURL from 'validator/es/lib/isURL';
import bcrypt from 'bcrypt';
import config from '../../config';

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: 5,
      lowercase: true,
      match: /^[a-z]/,
      unique: true,
    },
    profilePictureUrl: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (url: string) => isURL(url),
        message: (props: { value: string }) =>
          `${props.value} is not a valid url`,
      },
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'Email is required'],
      unique: [true, 'Email already exists'],
      validate: {
        validator: (email: string) => isEmail(email),
        message: (props: { value: string }) =>
          `${props.value} is not a valid email`,
      },
    },
    password: {
      type: String,
      trim: true,
      required: [true, 'Password is required'],
      validate: {
        validator: (password: string) => isStrongPassword(password),
        message: 'Password must be strong',
      },
      // omit password field in the query result
      select: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// has the password before storing into db
userSchema.pre('save', async function (next) {
  try {
    await bcrypt.hash(this.password, config.bcrypt_salt_rounds!);
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

// make the password field empty for after save response
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

export const User = model<IUser>('User', userSchema);
