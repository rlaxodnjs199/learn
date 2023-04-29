const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

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

exports.forgotPassword = async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('Invalid email address', 404));
  }
  // 2) Generate the random resetToken
  const resetToken = user.createPasswordResetToken();
  // Turn off validator because fields like
  // 'passwordConfirm' is not needed anymore
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Go to: ${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Please reset your password!',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email.'));
  }
};

exports.resetPassword = async (req, res, next) => {
  // 1) Get user based on the resetToken
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // Need to use save not update for password related or sensitive data update
  // since we always want to run validators.
  // update() doesn't run validators.
  await user.save();
  // 3) Update changedPasswordAt property of the user

  // 4) Log the user in, and send JWT
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
};
