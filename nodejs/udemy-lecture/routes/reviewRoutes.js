const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// We need to turn on a mergeParams option to
// receive params defined in other routers.
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
