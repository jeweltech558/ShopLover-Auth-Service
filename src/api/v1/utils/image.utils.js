const ApiError = require("../errors/ErrorHandler");

const resizeImages = (width, height) => async (req, res, next) => {
  if (!req.files) {
    return next(new ApiError("No File(s) Found!!", httpStatus.NOT_FOUND));
  }

  try {
    await Promise.all(
      req.files.map(async (file, index) => {
        const filename = file.originalname;
        const extName = file.mimetype.replace("image/", "");

        //const newFilename = `${uuidv4()}.${extName}`;

        const { data, info } = await sharp(file.buffer)
          .resize(width, height, {
            fit: "inside",
          })
          // .toBuffer(__dirname + `/upload/${newFilename}`);
          .toBuffer({ resolveWithObject: true });

        req.files[index] = resizedImage;
      })
    );
  } catch (error) {
    console.log(error);
    return next(
      new ApiError("Image(s) Resize Failed !", httpStatus.INTERNAL_SERVER_ERROR)
    );
  }

  next();
};

const saveToDisk = (basePath) => async (req, res) => {
  console.log("Images:: ", req.files);

  const images = req.files.map((image) => "" + image + "").join("");

  try {
    await Promise.all(
      req.files.map(async (file, index) => {
        // const filename = file.originalname;
        const extName = file.mimetype.replace("image/", "");

        const newFilename = `${uuidv4()}.${extName}`;

        await sharp(file.data).toFile(basePath + `/upload/${newFilename}`);

        req.files[index] = resizedImage;
      })
    );
  } catch (error) {
    console.log(error);
    return next(
      new ApiError("Image Resize Failed", httpStatus.INTERNAL_SERVER_ERROR)
    );
  }

  return res.send(`Images were uploaded:${images}`);
};
