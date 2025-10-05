const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pool = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: "http://localhost:5173", // your React app's URL
    credentials: true, // allow cookies, auth headers, etc.
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

pool
  .connect()
  .then(() => console.log("Successfully connected to the database!"))
  .catch((err) => console.error("Error connecting to the database:", err));

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Routes
const adminRoutes = require("./routes/admins");
app.use("/api/admins", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
