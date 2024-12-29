import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router } from './app/routes';
import notFound from './app/middlewares/not-found';
import httpStatus from 'http-status';

// express app instance
const app = express();

// application level middlewares that execute for every type of http request
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: '*', credentials: true }));

// root route
app.get('/', (req, res) => {
  res.status(httpStatus.OK).json({ message: 'Server is running' });
});

// application routes
app.use('/api/v1', router);

// not found middleware
app.use(notFound());

export default app;
