const express = require("express");
const router = express.Router();

const {
  createPrediction,
  getUserPredictions,
} = require("../controllers/predictionController");

router.post("/", createPrediction);
router.get("/user/:userId", getUserPredictions);
router.delete("/", deletePrediction);

module.exports = router;