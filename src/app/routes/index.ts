import express from 'express';

// it's a mini application also a route handler itself
// every http request to '/api/v1' will be handled by this router
export const router = express.Router();

const routes = [
  {
    path: '/test',
    handler: express.Router(),
  },
];

routes.forEach((route) => router.use(route.path, route.handler));
