let stackVar;
const asyncHandler = (API) => {
  return (req, res, next) => {
    API(req, res, next).catch(async (err) => {
      stackVar = err.stack;
      if (req.method != "GET") {
        if (req.file) {
          if (req.ImagePath) {
            await cloudinary.api.delete_resources_by_prefix(req.ImagePath);
            await cloudinary.api.delete_folder(req.ImagePath);
          }
        }
      }

      if (req.failedDocument) {
        const { model, _id } = req.failedDocument;
        await model.findByIdAndDelete(_id);
      }
      if (err.code == 11000) {
        next(new Error("Email already exist", { cause: 400 }));
      } else {
        return next(new Error(err.message));
      }
    });
  };
};

//global response
const globalResponse = (err, req, res, next) => {
  if (err) {
    if (req.validationErrorArr) {
      res.status(err["cause"] || 400).json({
        message: "Validation Error",
        Error: req.validationErrorArr,
      });
    }
    if (process.env.ENV_MODE == "DEV") {
      return res.status(err["cause"] || 500).json({
        message: "Fail Response",
        Error: err.message,
        stack: stackVar,
      });
    }
    res.status(err["cause"] || 500).json({
      message: "Fail Response",
      Error: err.message,
    });
  }
};

export { globalResponse, asyncHandler };
