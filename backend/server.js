const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pool = require("./db");
require("dotenv").config();
const path = require("path");

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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());

app.use("/imgUploads", express.static(path.join(__dirname, "imgUploads")));

pool
  .connect()
  .then(() => console.log("Successfully connected to the database!"))
  .catch((err) => console.error("Error connecting to the database:", err));

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Routes
const adminRoutes = require("./routes/admins");
const categoryRoutes = require("./routes/categories");
const testsRouter = require("./routes/tests");
const testInfosRouter = require("./routes/testInfos");
const imgUploadRoutes = require("./routes/imgUploads");
const formRoutes = require("./routes/forms");

app.use("/api/admins", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tests", testsRouter);
app.use("/api/test-infos", testInfosRouter);
app.use("/api/uploads", imgUploadRoutes);
app.use("/api/forms", formRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
