import cloudinary from "./server/src/config/cloudinary.js";
async function test() {
  try {
    const buffer = Buffer.from("dummy data for raw upload", "utf-8");
    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder: "vibechat_attachments" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });
    const res = await uploadPromise;
    console.log("SUCCESS:", res.secure_url);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
test();
