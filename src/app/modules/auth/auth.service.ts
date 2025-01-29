import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { ILoginCredentials } from './auth.interface';
import { createToken } from './auth.utils';
import config from '../../config';

// a successful login
// will return the payload that is used to create a sessionToken
// also return sessionToken itself
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

  // create payload to sign token

  const payload = { username };

  const sessionToken = await createToken(
    payload,
    config.session_token_secret!,
    Number(config.session_token_expires_in!)
  );

  return { payload, sessionToken };
};

export const authServices = {
  authenticateUser,
};
