import cron from "node-cron";
import Message from "../model/message.model.js";
import cloudinary from "../config/cloudinary.js";

// Run every hour at minute 0
cron.schedule("0 * * * *", async () => {
  console.log("Running cron job: Cleaning up attachments older than 48 hours...");
  try {
    const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
    
    const oldMessages = await Message.find({
      createdAt: { $lt: cutoffDate },
      attachments: { $not: { $size: 0 } }
    });

    let deletedCount = 0;

    for (const msg of oldMessages) {
      for (const att of msg.attachments) {
        if (att.url.includes("cloudinary.com")) {
          // Extract public_id from Cloudinary URL
          // Example: https://res.cloudinary.com/qbacwzmk/image/upload/v123/folder/abc.jpg
          const urlParts = att.url.split('/');
          const vIndex = urlParts.findIndex(p => p.match(/^v\d+$/));
          
          if (vIndex !== -1) {
            let publicIdWithExt = urlParts.slice(vIndex + 1).join('/');
            let publicId = publicIdWithExt.split('.').slice(0, -1).join('.'); // Remove extension
            
            const resourceType = att.type === "image" ? "image" : (att.type === "video" || att.type === "audio" ? "video" : "raw");
            
            try {
              await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            } catch (cloudErr) {
              console.error(`Failed to delete cloudinary asset ${publicId}:`, cloudErr.message);
            }
          }
        }
      }
      
      // Clear attachments from DB so they don't show up
      msg.attachments = [];
      await msg.save();
      deletedCount++;
    }

    if (deletedCount > 0) {
      console.log(`Cron Cleanup: Deleted attachments from ${deletedCount} messages.`);
    }
  } catch (error) {
    console.error("Cron Cleanup Error:", error);
  }
});
