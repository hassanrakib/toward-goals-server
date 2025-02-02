import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { ILoginCredentials, SessionPayload } from './auth.interface';

// a successful login
// will return the payload that will be used to create a session
const authenticateUser = async ({ username, password }: ILoginCredentials) => {
  // Step 1: Checking the user's existence in the db
  const user = await User.getUserFromDB(username, 'isDeleted', true);

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid username or password');
  }

  // Step 2: Checking if the account is deleted
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'The account has been deleted');
  }

  // Step 3: Checking the login password
  const isPasswordMatched = await user.checkPassword(password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid username or password');
  }

  // create and return payload to create a session
  const payload: SessionPayload = { username };

  return payload;
};

export const authServices = {
  authenticateUser,
};
