import { HydratedDocument, Model } from 'mongoose';

export interface IUser {
  username: string;
  profilePictureUrl?: string;
  email: string;
  password: string;
  isDeleted?: boolean;
}

// all user instance methods
export interface IUserMethods {
  checkPassword(plainTextPassword: string): Promise<boolean>;
}

// model type that knows about IUserMethods & static methods
export interface UserModel extends Model<IUser, {}, IUserMethods> {
  // static methods
  getUserFromDB(
    username: string
  ): Promise<HydratedDocument<IUser, IUserMethods>> | null;
}

export type SanitizedUser = Omit<IUser, 'password'> & { _id: string };
