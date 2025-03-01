const jwt = require("jsonwebtoken");

const JwtService = {
  sign(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    });
  },
  verify(token) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return null;
      return res.sendStatus(403);
      req.user = user;
      next();
    });
  },
};
