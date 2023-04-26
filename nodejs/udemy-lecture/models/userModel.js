const mongoose = require('mongoose');
const validator = require('validator');

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
  },
});

// Model is a constructor function that provides an interface to
// interact with MongoDB based on a schema.
const User = mongoose.model('User', userSchema);

module.exports = User;
