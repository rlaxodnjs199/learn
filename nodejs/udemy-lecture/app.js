const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const errorHandler = require('./controllers/errorController');

const app = express();

// Setup 'pug' view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// import static file folder
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// morgan: used for logging middleware
// GET /public/overview.html 404 1.380 ms - 159
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiter
// Limit to 100 requests per hour from one IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Rate Limit exceeded',
});
app.use('/api', limiter);

// middleware: function that can modify incoming request
// express.json(): parse incoming requests with JSON payloads
// limit body size to 10kb
app.use(express.json({ limit: '10kb' }));

// Data sanitization
// Prevent NoSQL query injection
// Check request body, params, and query strings
// and filter out $ and .
app.use(mongoSanitize());
// Prevent XSS attack
// filter malicious HTML symbols
app.use(xss());

// Prevent parameter pollution
// If not listed in whitelist, when there are duplicate parameters,
// only the last one will be used.
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'maxGroupSize',
      'difficulty',
      'ratingsAverage',
      'price',
    ],
  })
);

// custom middleware function
// all the middleware function receives req, res,next as parameters.
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // need to call next() to go to the next step of request-response cycle.
  next();
});

app.get('/', (req, res) => {
  res.status(200).render('base');
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// API router works in sequencial order.
// If the route has not been handled before, it will be fallen into
// this default error route handler.
app.all('*', (req, res, next) => {
  // if next function receives an argument,
  // express knows that it is an error,
  // and skips all next middlewares other than error-handling middleware.
  next(new AppError(`Cant't find ${req.originalUrl} on this server!`, 404));
});

// Central Error handler middleware
// By explicitly define a function with 4 arguments,
// express knows that this is error-handling middleware.
app.use(errorHandler);

module.exports = app;
