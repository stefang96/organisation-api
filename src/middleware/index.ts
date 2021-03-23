export const getToken = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.toString().split(" ")[1];
    req.body.token = token;
  }

  next();
};
