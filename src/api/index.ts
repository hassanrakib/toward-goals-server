// this file is vercel deployment specific

// import the app
import app from '../app';
// import the middleware
import dbConnect from '../app/middlewares/db-connect';

// make sure db connection established before doing db operations
app.use(dbConnect());

// export the app
export default app;
