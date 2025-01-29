import express from 'express';
import validateRequest from '../../middlewares/validate-request';
import { authValidations } from './auth.validation';
import { authControllers } from './auth.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/login',
  validateRequest(authValidations.loginCredentialsSchema),
  authControllers.logIn
);

router.post('/create-session', auth(), authControllers.createSession);

export const authRoutes = router;
