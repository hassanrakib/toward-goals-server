import express from 'express';
import { userControllers } from './user.controller';
import validateRequest from '../../middlewares/validate-request';
import { userValidations } from './user.validation';

// a mini application to handle different routes
// a router iteself is a middleware or route handler
const router = express.Router();

router.post(
  '/create-user',
  validateRequest(userValidations.createUserSchema),
  userControllers.createUser
);

export const UserRoutes = router;
