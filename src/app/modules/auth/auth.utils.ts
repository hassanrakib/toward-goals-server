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

export const createSession = async (
  payload: ISessionPayload,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  res: Response
) => {
  const expiresIn = Number(config.session_expires_in!);

  const session = await encrypt(payload, expiresIn);

  // don't remove the code below
  // when using custom domain, use the code below
  // for now, because of having different domain for backend & frontend (next.js) server
  // setting the cookie from here making the cookie scoped only to the backend server domain
  // so next.js client components direct api requsts to the backend, have access to cookies but
  // when sending request to the frontend (next.js) server cookies not found for the frontend domain
  // that's why frontend server domain can't access cookie using the cookies() api
  // ----- the code is redundant for the reason above -------
  // res.cookie('session', session, {
  //   secure: config.NODE_ENV === 'production',
  //   httpOnly: true,
  //   sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
  //   // cookie's maxAge must be 5 minute (300000ms) less
  //   // than session's expiration time
  //   // as we don't want to keep expired session in the cookie
  //   // session expiration time is in seconds
  //   // but maxAge needs to be in milliseconds
  //   maxAge: expiresIn * 1000 - 300000,
  // });

  // as the above code is redundant
  // return the session instead of setting cookie
  return session;
};
