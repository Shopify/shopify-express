module.exports = function createVerifyAuth({onFail} = {}) {
  return function verifyAuth(request, response, next) {
    const {shop} = request.query;
    const {session} = request;

    if (session && session.accessToken) {
      return next();
    }

    if (onFail) {
      return onFail(request, response);
    }

    return response.status(401).json('Unauthorized');
  };
};
