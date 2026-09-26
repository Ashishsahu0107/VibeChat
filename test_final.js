import cloudinary from "./server/src/config/cloudinary.js";
async function test() {
  try {
    const b64 = Buffer.from("dummy webm data", "utf-8").toString("base64");
    const dataURI = `data:video/webm;base64,${b64}`;
    const res = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: "vibechat_attachments"
    });
    console.log("SUCCESS FINAL:", res.secure_url);
  } catch(e) {
    console.log("ERROR FINAL:", e.message);
  }
}
test();
