const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: "kolifish_products" },
      (error, result) => {
        if (error) return res.status(500).json({ msg: error.message });
        return res.json({
          msg: "Uploaded",
          imageUrl: result.secure_url,
        });
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;