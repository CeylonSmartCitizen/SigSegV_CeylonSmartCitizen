const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    service: "Ceylon Auth Service",
    timestamp: new Date().toISOString()
  });
});

app.post("/register", (req, res) => {
  res.json({ message: "Registration endpoint - Coming soon!" });
});

app.post("/login", (req, res) => {
  res.json({ message: "Login endpoint - Coming soon!" });
});

console.log("Auth Service starting...");

app.listen(PORT, "0.0.0.0", () => {
  console.log("Auth Service running on port " + PORT);
});
