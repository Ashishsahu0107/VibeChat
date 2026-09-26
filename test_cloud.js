import cloudinary from "./server/src/config/cloudinary.js";
import fs from "fs";

async function test() {
  try {
    const buffer = Buffer.from("dummy audio data for testing webm upload via stream", "utf-8");
    
    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "video", folder: "vibechat_attachments", format: "webm" },
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
