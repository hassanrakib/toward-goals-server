import jwt from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

export const createToken = (
  payload: { username: string },
  secretKey: string,
  expiresIn: string
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

export const verifyToken = (token: string, secretKey: string) => {
  jwt.verify(token, secretKey, function (err, decoded) {
    if (err) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You must login to access the resource'
      );
    } else {
      return decoded;
    }
  });
};