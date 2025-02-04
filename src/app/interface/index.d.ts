import { JwtPayload } from 'jsonwebtoken';
import { ISessionPayload } from '../modules/auth/auth.interface';

export type CustomJwtPayload = ISessionPayload & JwtPayload;

// add 'user' property to the express Request interface
declare global {
  namespace Express {
    interface Request {
      user: CustomJwtPayload;
    }
  }
}
