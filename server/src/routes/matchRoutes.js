const express = require("express");
const router = express.Router();

const {
  getAllMatches,
  getMatchById,
} = require("../controllers/matchController");

router.get("/", getAllMatches);
router.get("/:id", getMatchById);

module.exports = router;