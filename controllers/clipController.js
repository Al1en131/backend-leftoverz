const fs = require("fs");
const multer = require("multer");
const FormData = require("form-data");

const upload = multer({ dest: "uploads/" });

async function getEmbeddingFromPython(imagePath) {
  const form = new FormData();
  form.append("data", fs.createReadStream(imagePath)); // Gradio expects field name "data"

  const response = await fetch("https://alien131-clip.hf.space/run/predict", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error: ${response.statusText} - ${errText}`);
  }

  const result = await response.json();
  return result.data[0]; 
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
    res
      .status(500)
      .json({ error: "Failed to embed image", detail: err.message });
  }
};

module.exports = { upload, embedLocalController, embedFormLocalController };
