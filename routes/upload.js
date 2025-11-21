const express = require("express");
const multer = require("multer");
const { Readable } = require("stream");
const cloudinary = require("../utils/cloudinary"); // .js extension not needed in CommonJS

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload/video", upload.single("file"), async (req, res) => {
  try {
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);

    const result = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "courses/videos",
      },
      (error, result) => {
        if (error) return res.status(500).json({ error });
        res.json({ url: result.secure_url, public_id: result.public_id });
      }
    );

    bufferStream.pipe(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/upload/image", upload.single("file"), async (req, res) => {
  try {
    const result = cloudinary.uploader.upload_stream(
      {
        folder: "courses/images",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return res.status(500).json({ error });
        res.json({ url: result.secure_url, public_id: result.public_id });
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
