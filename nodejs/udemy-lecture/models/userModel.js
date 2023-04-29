const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Schema is a blueprint that defines the structure of a document
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your eamil'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    // hide this field from the response
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // Custom validator only works on CREATE and SAVE
      validator: function (el) {
        return this.password === el;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// pre middleware that acts between
// receiving data and persist data on the database.
userSchema.pre('save', async function (next) {
  // this -> document object
  // Only run this function when the password is modified
  if (!this.isModified('password')) return next();

  // bcrypt.hash(target, num_cpu_cores)
  // higher num_cpu_cores produces more safe password
  this.password = await bcrypt.hash(this.password, 12);
  // sanitize passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // sometimes this code finished before JWT actually created,
  // which causes error in JWT validation logic.
  // So we want to substract 2 seconds to make sure that
  // passwordChangedAt is always before JWT timestamp.
  this.passwordChangedAt = Date.now() - 2000;
  next();
});

// Create an instance method that is available on the specific document.
userSchema.methods.correctPassword = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // password was never been changed.
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // store encrypted token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // expire after 10min
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // send unencrypted version to email and
  // store encrypted version to DB to validate later
  return resetToken;
};

// Model is a constructor function that provides an interface to
// interact with MongoDB based on a schema.
const User = mongoose.model('User', userSchema);

module.exports = User;
