const fs = require("fs");
const multer = require("multer");
const FormData = require("form-data");

const upload = multer({ dest: "uploads/" });

async function getEmbeddingFromPython(imagePath) {
  const form = new FormData();
  form.append("data", fs.createReadStream(imagePath)); // field name "data" untuk Gradio

  const response = await fetch("https://alien131-clip.hf.space/api/predict", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Error: ${response.statusText} - ${errText}`);
  }

  const data = await response.json();

  // ✅ Sesuaikan respons Gradio
  const embedding = data.data[0];
  return embedding;
}

const embedLocalController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imagePath = req.file.path;
    console.log("📸 Uploaded image path:", imagePath);

    const embedding = await getEmbeddingFromPython(imagePath);
    console.log("✅ Got embedding:", embedding.slice(0, 5), "...");

    // Hapus file setelah selesai
    await fs.promises.unlink(imagePath);

    return res.status(200).json({ embedding });
  } catch (err) {
    console.error("❌ embed-local error:", err);
    return res
      .status(500)
      .json({ error: "Failed to embed image", detail: err.message });
  }
};

// Opsional: kalau `embedFormLocalController` tidak beda jauh, bisa dihapus atau ganti isinya sama
const embedFormLocalController = embedLocalController;

module.exports = {
  upload,
  embedLocalController,
  embedFormLocalController,
};
