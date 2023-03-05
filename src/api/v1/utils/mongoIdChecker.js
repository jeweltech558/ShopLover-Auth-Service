const mongoIdChecker = (id) => {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return false;
  } else {
    return true;
  }
};

module.exports = mongoIdChecker;
