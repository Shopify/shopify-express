module.exports = function rawBody(req, res, next) {
  req.rawBody = '';
  req.on('data', chunk => {
    req.rawBody += chunk;
  });
  next();
};
