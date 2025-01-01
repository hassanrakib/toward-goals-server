import { z } from 'zod';
import isStrongPassword from 'validator/es/lib/isStrongPassword';

const createUserSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .min(5, { message: 'Username must be at least 5 characters long' })
    .regex(/^[a-z]/, {
      message: 'Username must start with a lowercase letter',
    })
    .trim()
    .toLowerCase(),
  profilePictureUrl: z
    .string()
    .trim()
    .toLowerCase()
    .url({ message: 'Profile picture URL must be a valid URL' })
    .optional()
    .default(''),
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
  isDeleted: z.boolean().optional().default(false),
});

export const userValidations = {
  createUserSchema,
};
