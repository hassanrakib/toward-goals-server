import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';

// it's a mini application also a route handler itself
// every http request to '/api/v1' will be handled by this router
export const router = express.Router();

const routes = [
  {
    path: '/users',
    handler: userRoutes,
  },
  {
    path: '/auth',
    handler: authRoutes,
  },
];

routes.forEach((route) => router.use(route.path, route.handler));
