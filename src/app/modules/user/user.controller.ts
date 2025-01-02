import { Request } from 'express';
import catchAsync from '../../utils/catch-async';
import { userServices } from './user.service';
import { IUser } from './user.interface';
import sendResponse from '../../utils/send-response';
import httpStatus from 'http-status';

// create a new user
const createUser = catchAsync(async (req: Request<{}, {}, IUser>, res) => {
  const user = await userServices.insertUserIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User created successfully',
    data: user,
  });
});

export const userControllers = {
  createUser,
};
