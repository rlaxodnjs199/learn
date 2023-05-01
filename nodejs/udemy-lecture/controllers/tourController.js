const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// middleware that set extra query parameters for us.
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // Since we set router to receive 'id' parameter...
  // populate to fill up referenced document data
  const tour = await Tour.findById(req.params.id);
  // .populate({
  //   path: 'guides',
  //   // select only interested properties.
  //   // -{propName} to exclude props
  //   select: '-__v -passwordChangedAt',
  // });

  if (!tour) {
    // Important to 'return' next function, not just 'call' it
    // to break the middleware chain.
    return next(new AppError('No tour found with the ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: tour,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // Create a new entry and save the entry to MongoDB
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // find id and update with req.body
  // new: if true, return updated result
  // runValidators: if true, run validator again after updating the result.
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    // Important to 'return' next function, not just 'call' it
    // to break the middleware chain.
    return next(new AppError('No tour found with the ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: tour,
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    // Important to 'return' next function, not just 'call' it
    // to break the middleware chain.
    return next(new AppError('No tour found with the ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // Select tours raingsAverage >= 4.5
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    // Group everything into one group (_id: null)
    // or separate group by difficulty (_id: '$difficulty')
    // and add extra fields with calculation.
    {
      $group: {
        // _id: null,
        // set _id = $difficulty, cast the value to uppercase.
        _id: { $toUpper: '$difficulty' },
        numRatings: { $sum: '$ratingsQuantity' },
        // sum 1 for each tour
        numTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    // Sorting.
    // we can use variables generated within aggregation.
    // 1 for ascending, -1 for descending
    { $sort: { avgPrice: 1 } },
    // We already set _id as $difficulty above.
    // Exclude (ne) difficulty (_id) = 'EASY'
    { $match: { _id: { $ne: 'EASY' } } },
  ]);
  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const plan = await Tour.aggregate([
    {
      // startDates 기준으로 document들을 분리
      // document: {startDates: [startDate1, startDate2, startDate3]}
      // -> document: {startDates: startDate1}
      //    document: {startDates: startDate2}
      //    document: {startDates: startDate3}
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      // group by month of startDates and count
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      // add 'month' field which is same as _id
      $addFields: { month: '$_id' },
    },
    {
      // Field with 0 will not show up
      $project: { _id: 0 },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      // set limit of documents to be present
      $limit: 6,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
