import { Request } from 'express';
import catchAsync from '../../utils/catch-async';
import { authServices } from './auth.service';
import { ILoginCredentials } from './auth.interface';
import sendResponse from '../../utils/send-response';
import httpStatus from 'http-status';
import config from '../../config';

// through a successful login we send {accessToken} as the response
// also refreshToken is sent via cookies
const logIn = catchAsync(
  async (req: Request<{}, {}, ILoginCredentials>, res) => {
    const { accessToken, refreshToken } = await authServices.authenticateUser(
      req.body
    );

    res.cookie('refreshToken', refreshToken, {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User login successful',
      data: { accessToken },
    });
  }
);

export const authControllers = {
  logIn,
};
