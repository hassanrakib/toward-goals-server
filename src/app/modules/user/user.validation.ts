import { isAlphanumeric, isLowercase, isStrongPassword } from 'validator';
import { z } from 'zod';

const createUserSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: 'Username is required' })
      .min(5, { message: 'Username must be at least 5 characters long' })
      .regex(/^[a-z]/, {
        message: 'Username must start with a lowercase letter',
      })
      .trim()
      .refine((username: string) => isLowercase(username), {
        message: 'Username can not contain uppercase letters',
      })
      .refine((username: string) => isAlphanumeric(username), {
        message: 'Username can not contain special characters',
      }),
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Email must be a valid email address' })
      .trim()
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .trim()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .refine((password: string) => isStrongPassword(password), {
        message: 'Password must be strong',
      }),
  }),
});

export const userValidations = {
  createUserSchema,
};
