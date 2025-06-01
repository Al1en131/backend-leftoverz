const fs = require("fs");
const multer = require("multer");
const FormData = require("form-data");

const upload = multer({ dest: "uploads/" });

async function getEmbeddingFromPython(imagePath) {
  const fetch = (await import("node-fetch")).default;

  const form = new FormData();
  form.append("image", fs.createReadStream(imagePath));

  const response = await fetch("http://127.0.0.1:5000/embed-image", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error: ${response.statusText} - ${errText}`);
  }

  const data = await response.json();
  return data.embedding;
}

const embedLocalController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = req.file.path;
    console.log("Image path:", imagePath);

    const embedding = await getEmbeddingFromPython(imagePath);
    console.log("Embedding:", embedding);

    await fs.promises.unlink(imagePath);

    return res.status(200).json({ embedding });
  } catch (err) {
    console.error("embed-local error:", err);
    return res
      .status(500)
      .json({ error: "Failed to embed image", detail: err.message });
  }
};

const embedFormLocalController = async (req, res) => {
  try {
    const imagePath = req.file.path;
    const embedding = await getEmbeddingFromPython(imagePath);

    await fs.promises.unlink(imagePath);

    res.status(200).json({ embedding });
  } catch (err) {
    console.error("embed-local error:", err);
    res.status(500).json({ error: "Failed to embed image", detail: err.message });
  }
};

module.exports = { upload, embedLocalController, embedFormLocalController };
