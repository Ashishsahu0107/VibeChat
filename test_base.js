import cloudinary from "./server/src/config/cloudinary.js";
async function test() {
  try {
    const buffer = Buffer.from("dummy data for raw upload", "utf-8");
    const b64 = buffer.toString("base64");
    const dataURI = `data:video/mp4;base64,${b64}`; // mp4 just to test if it accepts it
    const res = await cloudinary.uploader.upload(dataURI, {
      resource_type: "video",
      folder: "vibechat_attachments"
    });
    console.log("SUCCESS:", res.secure_url);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
test();
