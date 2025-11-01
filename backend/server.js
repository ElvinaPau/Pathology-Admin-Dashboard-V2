const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pool = require("./db");
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;

// CORS to allow your iPhone to connect
app.use(
  cors({
    origin: [
      "http://localhost:5173", // React app
      "http://10.167.177.31:5173", // React app via IP
      "http://localhost:*", // Any localhost port
      "http://10.167.177.31:*", // Any port on your IP (for Flutter)
    ],
    credentials: true,
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
const contactsRoute = require("./routes/contacts");

app.use("/api/admins", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tests", testsRouter);
app.use("/api/test-infos", testInfosRouter);
app.use("/api/uploads", imgUploadRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/contacts", contactsRoute);

// Listen on all network interfaces (0.0.0.0) instead of just localhost
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://10.167.177.31:${PORT}`);
});
