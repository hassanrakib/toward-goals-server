import { JwtPayload } from 'jsonwebtoken';

export interface CustomJwtPayload extends JwtPayload {
  username: string;
}

// add 'user' property to the express Request interface
declare global {
  namespace Express {
    interface Request {
      user: CustomJwtPayload;
    }
  }
}
