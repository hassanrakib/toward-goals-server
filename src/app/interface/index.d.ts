import { JwtPayload } from 'jsonwebtoken';
import { SessionPayload } from '../modules/auth/auth.interface';

export type CustomJwtPayload = SessionPayload & JwtPayload;

// add 'user' property to the express Request interface
declare global {
  namespace Express {
    interface Request {
      user: CustomJwtPayload;
    }
  }
}
