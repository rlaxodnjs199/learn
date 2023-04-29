const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Validate user input format
  if (!email || !password) {
    // Should return and finish the login function right away.
    // Otherwise, code below will be executed.
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2. Validate user input on DB
  // If you want to explicitly bring back hided fields, use .select('+field')
  // Since password was hidden by default, you should bring it back to make this work.
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in!', 401));
  }
  // 2) Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check if user still exists (User can be deactivated before JWT expired.)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user no longer exists.'));
  }
  // 4) Check if user changed password after JWT was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed a password. Please log in again.',
        401
      )
    );
  }
  // not catched by any error handlers -> Grant access to the routes
  // pass user data to the req object so that it can be utilized.
  req.user = currentUser;
  next();
});

// How to pass argument to the middleware?
// Write a wrapper function that takes arguments
// and returns a middleware function.
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // since we store user object to req.user in previous middleware
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have a permission to perform this action.',
          403
        )
      );
    }
    next();
  };
