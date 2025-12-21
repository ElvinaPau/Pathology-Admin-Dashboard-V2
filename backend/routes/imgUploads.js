const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const router = express.Router();

// Initialize Supabase client (using your existing connection)
const supabase = createClient(
  process.env.SUPABASE_URL || "https://dhpgobhitwishyysgnda.supabase.co",
  process.env.SUPABASE_SERVICE_KEY
);

// Configure multer to store in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max (adjust if needed: 5MB, 20MB, etc.)
    files: 1, // Only 1 file per request
    fieldSize: 10 * 1024 * 1024, // Max field value size
  },
  fileFilter: (req, file, cb) => {
    // Accept only common image formats
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"),
        false
      );
    }
  },
});

// POST /api/uploads/image - Upload image to Supabase Storage
router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Generate unique filename
    const fileExt = req.file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `pathology_images/${fileName}`;

    console.log(`Uploading image: ${fileName} (${req.file.size} bytes)`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("images") // Bucket name - you'll create this in Supabase dashboard
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({
        error: "Failed to upload image",
        details: error.message,
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    console.log("Image uploaded to Supabase:", imageUrl);

    res.json({
      url: imageUrl,
      path: filePath, // Store this for deletion
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/uploads/image - Delete image from Supabase Storage
router.delete("/image", async (req, res) => {
  try {
    const { path } = req.body;

    if (!path) {
      return res.status(400).json({ error: "Image path is required" });
    }

    const { error } = await supabase.storage.from("images").remove([path]);

    if (error) {
      console.error("Supabase delete error:", error);
      return res.status(500).json({ error: "Failed to delete image" });
    }

    console.log("✓ Image deleted from Supabase:", path);
    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/uploads/images - List all images
router.get("/images", async (req, res) => {
  try {
    const { data, error } = await supabase.storage
      .from("images")
      .list("pathology_images", {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      return res.status(500).json({ error: "Failed to list images" });
    }

    const images = data.map((file) => {
      const path = `pathology_images/${file.name}`;
      const { data: urlData } = supabase.storage
        .from("images")
        .getPublicUrl(path);

      return {
        name: file.name,
        path: path,
        url: urlData.publicUrl,
        size: file.metadata?.size,
        created: file.created_at,
      };
    });

    res.json({ images, count: images.length });
  } catch (error) {
    console.error("List error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
