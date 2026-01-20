const express = require("express");
const router = express.Router();
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  publishProperty,
  getMyProperties,
} = require("../controllers/propertyController");
const { protect, authorize } = require("../middleware/Auth");

// Public routes
router.get("/", getProperties);
router.get("/:id", getProperty);

// Protected routes - Owners only, except deletion which can b done by Admins
router.post("/", protect, authorize("owner"), createProperty);
router.put("/:id", protect, authorize("owner"), updateProperty);
router.delete("/:id", protect, authorize("owner", "admin"), deleteProperty);
router.put("/:id/publish", protect, authorize("owner"), publishProperty);
router.get("/my-properties/all", protect, authorize("owner"), getMyProperties);

module.exports = router;
