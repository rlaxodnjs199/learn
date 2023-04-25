// catchAsync should return a function that express can run whenever needed
// rather than run a function by itself.
module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);
