import { Request } from 'express';
import catchAsync from '../../utils/catch-async';
import { authServices } from './auth.service';
import { ILoginCredentials } from './auth.interface';
import sendResponse from '../../utils/send-response';
import httpStatus from 'http-status';
import config from '../../config';

// through a successful login we return the payload
// and set session cookie also sessionToken cookie
const logIn = catchAsync(
  async (req: Request<{}, {}, ILoginCredentials>, res) => {
    const { payload, sessionToken } = await authServices.authenticateUser(
      req.body
    );

    // set sessionToken in the client side
    res.cookie('sessionToken', sessionToken, {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      // cookie's maxAge must be 5 minute (300000ms) less
      // than sessionToken's expiration time
      // as we dont want to keep expired token in the cookie
      // session token expiration time is in seconds
      // but maxAge needs to be in milliseconds
      maxAge: Number(config.session_token_expires_in) * 1000 - 300000,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User login successful',
      data: payload,
    });
  }
);

// createSession will set the "session" cookie
const createSession = catchAsync((req, res) => {
  const payload = { username: req.user.username };

  // create a "session" cookie
  // this cookie doesn't have maxAge / expires options set, so it will
  // get deleted after the user ends his session meaning closing browser tabs
  res.cookie('session', JSON.stringify(payload), {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User session created',
    data: payload,
  });
});

export const authControllers = {
  logIn,
  createSession,
};
