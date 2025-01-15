import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validate-request';
import { taskValidations } from './task.validation';
import { taskControllers } from './task.controller';
import fileUpload from '../../middlewares/file-upload';

const router = express.Router();

router.post(
  '/create-time-span',
  auth(),
  validateRequest(taskValidations.createTimeSpanSchema),
  taskControllers.createTimeSpan
);

router.post(
  '/create-task',
  auth(),
  fileUpload(),
  validateRequest(taskValidations.createTaskSchema),
  taskControllers.createTask
);

export const taskRoutes = router;
