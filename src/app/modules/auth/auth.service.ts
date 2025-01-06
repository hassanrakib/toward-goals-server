import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { ILoginCredentials } from './auth.interface';
import { createToken } from './auth.utils';
import config from '../../config';

// through a successful login => we get accessToken & refreshToken
const authenticateUser = async ({ username, password }: ILoginCredentials) => {
  // Step 1: Checking the user's existence in the db
  const user = await User.getUserFromDB(username);

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

  // Step 4: Access Granted => Create access token & refresh token
  const accessToken = await createToken(
    { username },
    config.jwt_access_secret!,
    config.jwt_access_expires_in!
  );

  const refreshToken = await createToken(
    { username },
    config.jwt_refresh_secret!,
    config.jwt_refresh_expires_in!
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const authServices = {
  authenticateUser,
};
