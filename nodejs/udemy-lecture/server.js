const mongoose = require('mongoose');
const dotenv = require('dotenv');

// globally handle uncaught exception
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

// load environment variables from the path
dotenv.config({ path: './config.env' });

const db = process.env.DB_URL.replace('<password>', process.env.DB_PASSWORD);

mongoose.connect(db).then(() => {
  console.log('DB connection successful');
});

// app needs to be loaded after loading an environment variable file.
const app = require('./app');

const server = app.listen(process.env.PORT, () => {
  console.log(`App running on port ${process.env.PORT}...`);
});

// globally handle unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  // gracefully shutdown the server
  server.close(() => {
    process.exit(1);
  });
});
