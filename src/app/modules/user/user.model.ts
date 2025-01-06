import { CallbackError, model, Schema } from 'mongoose';
import { IUser, IUserMethods, UserModel } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../config';
import {
  isStrongPassword,
  isEmail,
  isURL,
  isLowercase,
  isAlphanumeric,
} from 'validator';

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [5, 'Username must be at least 5 characters long'],
      lowercase: true,
      match: [/^[a-z]/, 'Username must start with a lowercase letter'],
      validate: [
        {
          validator: (username: string) => isLowercase(username),
          message: 'Username can not contain uppercase letters',
        },
        {
          validator: (username: string) => isAlphanumeric(username),
          message: 'Username can not contain special characters',
        },
      ],
      unique: true,
    },
    image: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (url: string) => isURL(url),
        message: (props: { value: string }) =>
          `${props.value} is not a valid url`,
      },
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

// hash the password before storing into db
userSchema.pre('save', async function (next) {
  try {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds!)
    );
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

// user instance methods
userSchema.methods.checkPassword = async function (plainTextPassword: string) {
  // 'this' referes to the user doc & doc.password is a hashed password
  return bcrypt.compare(plainTextPassword, this.password);
};

// static methods
userSchema.statics.getUserFromDB = async function (username: string) {
  // 'this' refers to the model
  return this.findOne({ username });
};

export const User = model<IUser, UserModel>('User', userSchema);
