import { IUser, ISanitizedUser } from './user.interface';
import { User } from './user.model';

const insertUserIntoDB = async (user: IUser) => {
  // save user to db and return the result
  const userDoc = await User.create(user);

  //   omit password field
  const sanitizedUser: ISanitizedUser = {
    _id: userDoc._id.toString(),
    username: userDoc.username,
    email: userDoc.email,
    profilePictureUrl: userDoc.profilePictureUrl,
    isDeleted: userDoc.isDeleted,
  };

  return sanitizedUser;
};

export const userServices = {
  insertUserIntoDB,
};
