import { IUser } from './user.interface';
import { User } from './user.model';

const insertUserIntoDB = async (user: IUser) => {
  // save user to db and return the result
  const userDoc = await User.create(user);

  return { username: userDoc.username };
};

export const userServices = {
  insertUserIntoDB,
};
