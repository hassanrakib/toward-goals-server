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
  session_token_secret: process.env.SESSION_TOKEN_SECRET,
  session_token_expires_in: process.env.SESSION_TOKEN_EXPIRES_IN,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  algolia_application_id: process.env.ALGOLIA_APPLICATION_ID,
  algolia_write_api_key: process.env.ALGOLIA_WRITE_API_KEY,
};
