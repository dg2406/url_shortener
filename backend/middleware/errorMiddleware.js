const errorMiddleware = (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      `${req.method} ${req.originalUrl}`,
      err
    );
  
    if (res.headersSent) {
      return next(err);
    }
  
    return res.status(
      err.statusCode || 500
    ).json({
      message:
        err.message ||
        "Internal server error"
    });
  };
  
  export default errorMiddleware;