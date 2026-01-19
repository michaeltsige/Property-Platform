const express = require("express");
const router = express.Router();
const {
  getMetrics,
  toggleProperty,
  getUsers,
  getAllProperties,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/Auth");

// All admin routes require admin role, so protect and AUTHORIZE(admin) is used
router.use(protect);
router.use(authorize("admin"));

router.get("/metrics", getMetrics);
router.put("/properties/:id/toggle", toggleProperty);
router.get("/users", getUsers);
router.get("/properties", getAllProperties);

module.exports = router;
