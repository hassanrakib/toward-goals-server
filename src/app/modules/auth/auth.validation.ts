import { z } from 'zod';

const loginCredentialsSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: 'Username is required' })
      .trim()
      .toLowerCase(),

    password: z.string({ required_error: 'Password is required' }).trim(),
  }),
});

export const authValidations = {
  loginCredentialsSchema,
};
