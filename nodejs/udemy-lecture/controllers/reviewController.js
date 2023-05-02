const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Review.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const reviews = await features.query;

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with the ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: review,
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // Even though req.body contains something weird, if it's not in schema,
  // then it will be ignored.
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newReview,
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    return next(new AppError('No review found with the ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: review,
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new AppError('No Review found with the ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
