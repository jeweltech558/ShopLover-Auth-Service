const httpStatus = require("http-status");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { mkdirp } = require("mkdirp");

const resizeImage = async (buffer, height, width) => {
  const resizedBuffer = await sharp(buffer)
    .resize({
      width: width ? width : null,
      height: height ? height : null,
      fit: "inside",
    })
    .toBuffer();

  return resizedBuffer;
};
const convertImage = async (buffer, toExtension) => {
  let convertedBuffer;
  if (toExtension === "png") {
    convertedBuffer = await sharp(buffer).png({ quality: 100 }).toBuffer();
  } else if (toExtension === "gif") {
    convertedBuffer = await sharp(buffer).gif({ quality: 100 }).toBuffer();
  } else if (toExtension === "jpeg") {
    convertedBuffer = await sharp(buffer).jpeg({ quality: 100 }).toBuffer();
  } else if (toExtension === "webp") {
    convertedBuffer = await sharp(buffer).webp({ quality: 100 }).toBuffer();
  } else {
    convertedBuffer = await sharp(buffer).jpeg({ quality: 100 }).toBuffer();
  }
  return convertedBuffer;
};

const saveToDisk = async (fileBuffer, filePath, name, extension) => {
  const newFile = name + "." + extension;
  const dirPath = path.join(process.env.IMAGE_SERVER_BASE_PATH, filePath);
  const fullFilePath = path.join(dirPath, newFile);

  mkdirp.sync(dirPath);

  await sharp(fileBuffer).toFile(fullFilePath);
  return fullFilePath;
};
module.exports = {
  resizeImage,
  saveToDisk,
  convertImage,
};
