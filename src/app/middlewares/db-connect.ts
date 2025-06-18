/*

In a Production Vercel Environment (Serverless):

##Cold Start: 
A request comes in, and Vercel needs to spin up a new serverless function instance.
This is a fresh Node.js process.

=> global.mongoose is undefined. (see index.d.ts for type declaration)
=> !cached is true.
=> The if (!cached) block executes, initializes the cache, and creates the database connection promise.

##Warm Start: Another request comes in shortly after, and Vercel reuses the same running instance.

=> This is like a "hot reload" – the process is still alive.
=> global.mongoose still holds the cached object.
=> !cached is false.
=> The if (!cached) block is skipped, and the rest of the function reuses the existing connection promise or established connection.


This is the entire point of the strategy:
=> Connect once per instance
=> euse that connection for all subsequent requests handled by that warm instance.

*/

import catchAsync from '../utils/catch-async';
import mongoose from 'mongoose';
import config from '../config';

const dbConnect = () => {
  return catchAsync(async (req, res, next) => {
    // set "cached" variable to refer the global mongoose object
    let cached = global.mongoose;

    // if cached is undefined (if global.mongoose undefined)
    if (!cached) {
      // initialize global.mongoose and assign the reference to the cached variable
      cached = global.mongoose = { conn: null, promise: null };
    }

    // if there is already a cached connection
    if (cached.conn) {
      console.log('DB CONNECTION FOUND: Reusing existing database connection.');
      // call the next middleware
      next();

      // don't execute the code below
      return;
    }

    // If a connection promise is not already in progress, a new one is created using mongoose.connect().
    //If multiple requests hit a new ("cold") serverless instance at the exact same time,
    // this check ensures only the first request starts the database connection.
    // The other requests see that a connection is already in progress (cached.promise exists) and simply wait for it to complete,
    // rather than wastefully starting their own connections.
    // The bufferCommands: false option is recommended to prevent Mongoose from buffering commands when it's not connected.
    if (!cached.promise) {
      console.log('DB CONNECTION NOT FOUND: Creating new database connection.');

      const opts = {
        bufferCommands: false,
      };

      // create a promise
      cached.promise = mongoose
        .connect(config.db_connection_uri!, opts)
        .then((mongoose) => {
          return mongoose.connection;
        });
    }
    // cache the connection
    cached.conn = await cached.promise;

    // call the next middleware
    next();
  });
};

export default dbConnect;
