import { Request } from 'express';
import catchAsync from '../../utils/catch-async';
import { authServices } from './auth.service';
import { ILoginCredentials } from './auth.interface';
import sendResponse from '../../utils/send-response';
import httpStatus from 'http-status';
import { createSession } from './auth.utils';
import AppError from '../../errors/AppError';

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

const checkUsername = catchAsync(
  async (req: Request<{}, {}, {}, { username?: string }>, res) => {
    const { username } = req.query;

    if (!username) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Username is required');
    }

    const data = await authServices.knowUsernameExistence(username);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Username check',
      data,
    });
  }
);

const checkEmail = catchAsync(
  async (req: Request<{}, {}, {}, { email?: string }>, res) => {
    const { email } = req.query;

    if (!email) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Email is required');
    }

    const data = await authServices.knowEmailExistence(email);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Email check',
      data,
    });
  }
);

export const authControllers = {
  logIn,
  checkUsername,
  checkEmail,
};
