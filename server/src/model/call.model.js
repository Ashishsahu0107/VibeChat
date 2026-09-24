import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional if it's a group call
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" }, // Context of the call
    type: { type: String, enum: ["audio", "video"], required: true },
    status: { type: String, enum: ["initiated", "ringing", "ongoing", "ended", "missed", "rejected"], default: "initiated" },
    startTime: { type: Date },
    endTime: { type: Date }
  },
  { timestamps: true }
);

callSchema.index({ caller: 1 });
callSchema.index({ receiver: 1 });
callSchema.index({ chatId: 1 });

const Call = mongoose.model("Call", callSchema);
export default Call;
