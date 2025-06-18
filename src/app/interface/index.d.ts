import { JwtPayload } from 'jsonwebtoken';
import { ISessionPayload } from '../modules/auth/auth.interface';
import mongoose from 'mongoose';

export type CustomJwtPayload = ISessionPayload & JwtPayload;

// The global object in Node.js is a special object like window in browsers.
// Its lifecycle is tied to the Node.js process.
declare global {
  namespace Express {
    interface Request {
      // add 'user' property to the express Request interface
      user: CustomJwtPayload;
    }
  }
  // add global variable "mongoose" type
  // eslint-disable-next-line no-var
  var mongoose:
    | {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
      }
    | undefined;
}
