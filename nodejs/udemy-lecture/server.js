const mongoose = require('mongoose');
const dotenv = require('dotenv');
// load environment variables from the path
dotenv.config({ path: './config.env' });

const db = process.env.DB_URL.replace('<password>', process.env.DB_PASSWORD);

mongoose.connect(db).then(() => {
  console.log('DB connection successful');
});

// app needs to be loaded after loading an environment variable file.
const app = require('./app');

app.listen(process.env.PORT, () => {
  console.log(`App running on port ${process.env.PORT}...`);
});
