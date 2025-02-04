import jwt from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { CustomJwtPayload } from '../../interface';
import config from '../../config';
import { ISessionPayload } from './auth.interface';
import { Response } from 'express';

const encrypt = (
  payload: ISessionPayload,
  expiresIn: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      config.session_secret!,
      { expiresIn },
      function (err, session) {
        if (err) {
          reject(
            new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              'An error occurred during the login process. Please try again later.'
            )
          );
        } else {
          resolve(session!);
        }
      }
    );
  });
};

export const decrypt = (
  session: string | undefined = ''
): Promise<CustomJwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(session, config.session_secret!, function (err, decoded) {
      if (err) {
        reject(
          new AppError(
            httpStatus.UNAUTHORIZED,
            'You must login to access the resource'
          )
        );
      } else {
        resolve(decoded as CustomJwtPayload);
      }
    });
  });
};

export const createSession = async (payload: ISessionPayload, res: Response) => {
  const expiresIn = Number(config.session_expires_in!);

  const session = await encrypt(payload, expiresIn);

  // set session in the client side
  res.cookie('session', session, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    // cookie's maxAge must be 5 minute (300000ms) less
    // than session's expiration time
    // as we don't want to keep expired session in the cookie
    // session expiration time is in seconds
    // but maxAge needs to be in milliseconds
    maxAge: expiresIn * 1000 - 300000,
  });
};
