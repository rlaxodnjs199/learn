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
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
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

// Model is a constructor function that provides an interface to
// interact with MongoDB based on a schema.
const User = mongoose.model('User', userSchema);

module.exports = User;
