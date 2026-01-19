const express = require("express");
const router = express.Router();
const {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
} = require("../controllers/favoriteController");
const { protect } = require("../middleware/Auth");

// All favorite routes require authentication, since its account specific
//removed duplicate use of protect by this line
router.use(protect);

//removed duplicate use of protect
router.post("/:propertyId", addFavorite);
router.delete("/:propertyId", removeFavorite);
router.get("/", getFavorites);
router.get("/check/:propertyId", checkFavorite);

module.exports = router;
