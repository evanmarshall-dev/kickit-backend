const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    if (!req.headers.authorization) {
      return res
        .status(401)
        .json({ err: "No authentication token provided. Please sign in." });
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ err: "Invalid authentication format. Please sign in again." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.payload;

    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ err: "Invalid authentication token. Please sign in again." });
    }
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ err: "Your session has expired. Please sign in again." });
    }
    res
      .status(401)
      .json({ err: "Authentication failed. Please sign in again." });
  }
}

module.exports = verifyToken;
