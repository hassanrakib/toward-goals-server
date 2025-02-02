import express from 'express';
import validateRequest from '../../middlewares/validate-request';
import { authValidations } from './auth.validation';
import { authControllers } from './auth.controller';

const router = express.Router();

router.post(
  '/login',
  validateRequest(authValidations.loginCredentialsSchema),
  authControllers.logIn
);

export const authRoutes = router;
