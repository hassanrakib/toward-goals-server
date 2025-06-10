import { Request } from 'express';
import catchAsync from '../../utils/catch-async';
import { userServices } from './user.service';
import { IUser } from './user.interface';
import sendResponse from '../../utils/send-response';
import httpStatus from 'http-status';
import { createSession } from '../auth/auth.utils';

// create a new user
const createUser = catchAsync(async (req: Request<{}, {}, IUser>, res) => {
  const payload = await userServices.insertUserIntoDB(req.body);

  // create session and set it to the cookie
  const session = await createSession(payload, res);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User created successfully',
    data: { session },
  });
});

export const userControllers = {
  createUser,
};
