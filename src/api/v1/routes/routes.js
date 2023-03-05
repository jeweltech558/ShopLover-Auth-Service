const express = require("express");
const router = express.Router();
const customerRoutes = require("./customer.routes");
// const marchantRoutes = require("./marchant.route");

router.use("/customer", customerRoutes);
// router.use("/user", userRoutes);
// router.use("/marchant", marchantRoutes);

module.exports = router;
