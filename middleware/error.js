class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  // Handle MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // Handle invalid JSON Web Token
  if (err.name === "JsonWebTokenError") {
    const message = "JSON Web Token is invalid";
    err = new ErrorHandler(message, 400);
  }

  // Handle expired JSON Web Token
  if (err.name === "TokenExpiredError") {
    const message = "JSON Web Token has expired";
    err = new ErrorHandler(message, 400);
  }

  // Handle Mongoose CastError (invalid ObjectId or similar)
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((error) => error.message)
        .join(" ")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

module.exports = { errorMiddleware, ErrorHandler };
