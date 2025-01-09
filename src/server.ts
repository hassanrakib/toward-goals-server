import app from './app';
import mongoose from 'mongoose';
import config from './app/config';
import { Server } from 'http';
import { seedRequirementsLevels } from './app/db';

let server: Server;

async function main() {
  try {
    // connect to mongodb
    await mongoose.connect(config.db_connection_uri!);

    // seed levels and every requirement levels
    seedRequirementsLevels();

    // create server
    server = app.listen(config.port, () => {
      console.log(`# Server is running in port ${config.port!}`);
    });
  } catch (err) {
    // error when connecting to mongodb
    console.log(err);
  }
}

// log unhandled promise rejection error & close the server
process.on('unhandledRejection', (error, promise) => {
  console.log({ error, promise });

  // graceful shutdown that lets existing connections to finish
  server.close(() => process.exit(1));
});

// handle synchronous code error
process.on('uncaughtException', (error) => {
  console.log({ error });

  // shutdown immediately
  process.exit(1);
});

void main();
