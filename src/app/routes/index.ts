import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.route';
import { goalRoutes } from '../modules/goal/goal.route';
import { subgoalRoutes } from '../modules/subgoal/subgoal.route';
import { rewardRoutes } from '../modules/reward/reward.route';
import { habitRoutes } from '../modules/habit/habit.route';

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
  {
    path: '/goals',
    handler: goalRoutes,
  },
  {
    path: '/subgoals',
    handler: subgoalRoutes,
  },
  {
    path: '/habits',
    handler: habitRoutes,
  },
  {
    path: '/rewards',
    handler: rewardRoutes,
  },
];

routes.forEach((route) => router.use(route.path, route.handler));
