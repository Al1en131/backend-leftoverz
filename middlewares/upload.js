const multer = require("multer");
const path = require("path");

// Setup storage untuk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Menyimpan gambar di folder uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file harus unik
  },
});

const upload = multer({ storage });

module.exports = upload;
