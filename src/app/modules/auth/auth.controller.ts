import { Request } from 'express';
import catchAsync from '../../utils/catch-async';
import { authServices } from './auth.service';
import { ILoginCredentials } from './auth.interface';
import sendResponse from '../../utils/send-response';
import httpStatus from 'http-status';
import { createSession } from './auth.utils';

const logIn = catchAsync(
  async (req: Request<{}, {}, ILoginCredentials>, res) => {
    const payload = await authServices.authenticateUser(req.body);

    // create session and set it to the cookie
    await createSession(payload, res);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User login successful',
      data: payload,
    });
  }
);

export const authControllers = {
  logIn,
};
