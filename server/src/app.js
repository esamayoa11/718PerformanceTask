const express = require("express");
const cors = require("cors");
require("dotenv").config();

const matchRoutes = require("./routes/matchRoutes");
const predictionRoutes = require("./routes/predictionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/matches", matchRoutes);
app.use("/api/predictions", predictionRoutes);

app.get("/", (req, res) => {
  res.send("World Cup API is running");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});