import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catch-async';
import { verifyToken } from '../modules/auth/auth.utils';
import config from '../config';
import { User } from '../modules/user/user.model';

// authorization middleware
const auth = () => {
  return catchAsync(async (req, res, next) => {
    // Step 1: Get token and check token existence
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You must login to access the resource'
      );
    }

    // Step 2: Verify token's validity and get the decoded user
    const decodedUser = await verifyToken(token, config.jwt_access_secret!);

    // Step 3: Make sure user's existence in the db
    const userInDb = await User.getUserFromDB(
      decodedUser.username,
      'isDeleted'
    );

    if (!userInDb) {
      throw new AppError(httpStatus.NOT_FOUND, 'The user is not a valid user');
    }

    // Step 4: Checking if the user is deleted
    if (userInDb.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'The account has been deleted');
    }

    // Step 5: Add decodedUser to the "user" property of req obj
    req.user = decodedUser;

    // Step 6: Go to the next middleware
    next();
  });
};

export default auth;
