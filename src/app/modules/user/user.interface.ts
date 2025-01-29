import { HydratedDocument, Model } from 'mongoose';

export interface IUser {
  username: string;
  image?: string;
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
    username: string,
    projection?: keyof Omit<IUser, 'image' | 'password'> | '_id',
    selectPassword?: boolean
  ): Promise<HydratedDocument<IUser, IUserMethods>> | null;
}
