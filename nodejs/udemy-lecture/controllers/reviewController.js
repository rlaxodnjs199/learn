const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

// middleware can be used to decouple logic
exports.setTourFilter = (req, res, next) => {
  if (req.params.tourId) req.body.filter = { tour: req.params.tourId };
  next();
};

// middleware can be used to decouple logic
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
