const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name.'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have less or equal than 10 characters'],
      // validate: [validator.isAlpha, 'A tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration.'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size.'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price.'],
    },
    priceDiscount: {
      type: Number,
      // custom validator
      validate: {
        validator: function (val) {
          // 'this' only points to current doc on NEW document creation.
          // Does not work on update.
          return val < this.price;
        },
        // {VALUE}: same as val, provided by mongoose.
        message: 'Discount price ({VALUE}) should be below the regular price.',
      },
    },
    summary: {
      type: String,
      // remove all white space at the beginning and at the end.
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // permanently hide this field from response
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // geo-spatial data
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    // embedded documents
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // embeded documents
    // guides: Array,
    // referencing documents
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    // Each time when the data is outputed as JSON or an Object,
    // includes virtual properties, which is computed properties
    // that are not actually stored in DB.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual property is a property that will not be stored
// in the database but will be calculated and returned once the
// schema has been called.

// virtual properties help moving code from controller to the model
// by supporting business logic requirements
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  // this: document that will going to be saved
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Middleware to save referenced object(Users) in a document(Tour).
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// // doc: just saved document
// // next: used to call next middleware if exists
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// executed for query functions start with find*
tourSchema.pre(/^find/, function (next) {
  // exclude documents with secretTour = true
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// Middleware to fill up 'guides' property,
// which is a referenced document property.
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);
  console.log(`Query took ${Date.now() - this.start} ms`);
  next();
});

// AGGREGATION MIDDLEWARE
// before and after aggregation happens
tourSchema.pre('aggregate', function (next) {
  // this: aggregation object
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
