import jwt from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { CustomJwtPayload } from '../../interface';

export const createToken = (
  payload: { username: string },
  secretKey: string,
  expiresIn: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secretKey, { expiresIn }, function (err, token) {
      if (err) {
        reject(
          new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'An error occurred during the login process. Please try again later.'
          )
        );
      } else {
        resolve(token!);
      }
    });
  });
};

export const verifyToken = (
  token: string,
  secretKey: string
): Promise<CustomJwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, function (err, decoded) {
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
