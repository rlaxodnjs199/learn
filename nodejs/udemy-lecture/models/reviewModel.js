const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'A review must have a rating.'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must be written by a user.'],
    },
  },
  {
    // Each time when the data is outputed as JSON or an Object,
    // includes virtual properties, which is computed properties
    // that are not actually stored in DB.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Set compound index and set the combination to be unique
// so that a user can write only one review per tour.
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// This will add more queries internally.
reviewSchema.pre(/^find/, function (next) {
  // If you don't need a chain of populate, then simply comment populate out.
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// static method to calculate statistics of tour that current review belongs to.
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // 'this' points to the model
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // if there is no review by deleting all, the stats will be just empty array.
  if (stats.length > 0) {
    // update ratingsQuantity and ratingsAverage in Tour document
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// pre vs post
// with pre, the document you are trying to save is not in DB yet.
// with post, the document should already be in the DB.
// post doesn't have access to 'next()'
reviewSchema.post('save', function () {
  // this.constructor -> Review Model
  // this -> review document
  this.constructor.calcAverageRatings(this.tour);
});

// post query middleware can take doc as an argument
// and it has access to the updated document.
reviewSchema.post(/^findOneAnd/, async (doc) => {
  if (doc) await doc.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
