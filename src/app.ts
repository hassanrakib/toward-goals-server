import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router } from './app/routes';
import notFound from './app/middlewares/not-found';
import httpStatus from 'http-status';
import errorHandler from './app/middlewares/error-handler';
import config from './app/config';
import dbConnect from './app/middlewares/db-connect';

// express app instance
const app = express();

// application level middlewares that execute for every type of http request
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: config.cors_origin!,
    credentials: true,
  })
);

// when production is deployed to vercel
// because, vercel uses serverless functions
// so, no long running server & db connection
// server.ts file is not needed for the app to work on vercel
if (config.NODE_ENV === 'production') {
  // make sure db connection established before doing db operations
  app.use(dbConnect());
}

// root route
app.get('/', (req, res) => {
  res.status(httpStatus.OK).json({ message: 'Server is running' });
});

// application routes
app.use('/api/v1', router);

// not found middleware
app.use(notFound());

// global error handling middleware
app.use(errorHandler());

export default app;
