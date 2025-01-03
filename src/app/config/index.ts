import dotenv from 'dotenv';
import path from 'path';

// config will read your .env to assign the contents to the process.env
dotenv.config({ path: path.join(process.cwd(), '.env') });

// export all environment variables
export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  db_connection_uri: process.env.DB_CONNECTION_URI,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
};
