import { mongo } from 'mongoose';

export type ErrorSources = {
  path: string | number;
  message: string;
}[];

export interface GeneralizedErrorResponse {
  statusCode: number;
  message: string;
  errorSources: ErrorSources;
}

export interface Error11000 extends mongo.MongoServerError {
  keyValue: Record<string, string>;
}

export interface ErrorResponse {
  statusCode: number;
  success: boolean;
  message: string;
  errorSources: ErrorSources;
  stack: string | null;
}

export type ErrorProcessor<T> = (err: T) => GeneralizedErrorResponse;
