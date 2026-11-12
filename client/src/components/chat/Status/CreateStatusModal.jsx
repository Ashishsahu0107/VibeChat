import React, { useState, useRef } from "react";
import { FiX, FiSend, FiImage, FiType } from "react-icons/fi";
import toast from "react-hot-toast";
import useStatusStore from "../../../store/useStatusStore";
import useChatStore from "../../../store/useChatStore";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const BG_COLORS = [
  "#1e1b4b", // deep indigo
  "#0f172a", // deep slate
  "#082f49", // deep ocean cyan
  "#2e1065", // deep violet
  "#14532d", // deep emerald
  "#701a75", // deep fuchsia
  "#831843", // deep rose
  "#18181b", // dark neutral
];

const CreateStatusModal = ({ type: initialType, onClose }) => {
  const [type, setType] = useState(initialType);
  const [content, setContent] = useState("");
  const [background, setBackground] = useState(BG_COLORS[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmittingRef = useRef(false);
  const { createStatus, isCreating } = useStatusStore();
  const { uploadAttachment } = useChatStore.getState();
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image and video size must be 5 MB or less");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    if (file.type.startsWith("video/")) {
      setType("video");
    } else {
      setType("image");
    }
  };

  const handlePost = async () => {
    // Guard against multiple clicks
    if (isSubmittingRef.current || isSubmitting || isCreating) return;

    if (type === "text") {
      if (!content.trim()) {
        toast.error("Please enter a status message");
        return;
      }
    } else {
      if (!selectedFile) {
        toast.error("Please select an image or video");
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error("Image and video size must be 5 MB or less");
        return;
      }
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      if (type === "text") {
        await createStatus({
          type: "text",
          content: content.trim(),
          background,
        });
      } else {
        // Upload media first
        const uploaded = await uploadAttachment(selectedFile);
        await createStatus({ type, content: uploaded.url, background: "#000" });
      }
      onClose();
    } catch (err) {
      console.error("Error creating status:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to post status",
      );
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isCreating;

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-2xl flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 text-white z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <button
          onClick={isBusy ? undefined : onClose}
          disabled={isBusy}
          className="p-2.5 glass-panel rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiX size={22} />
        </button>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 p-1 rounded-full glass-panel border border-white/10 bg-white/5">
          <button
            disabled={isBusy}
            onClick={() => {
              setType("text");
              setPreview(null);
              setSelectedFile(null);
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              type === "text"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : "text-white/60 hover:text-white hover:bg-white/10"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <FiType size={15} />
            <span>Text</span>
          </button>
          <button
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              type !== "text"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                : "text-white/60 hover:text-white hover:bg-white/10"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <FiImage size={15} />
            <span>Media</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*,video/*"
            onChange={handleFile}
            disabled={isBusy}
          />
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden px-4">
        {type === "text" ? (
          <div
            className="w-full h-full max-w-xl mx-auto flex flex-col justify-center items-center rounded-3xl p-8 transition-colors duration-500 relative border border-white/10 shadow-2xl"
            style={{ backgroundColor: background }}
          >
            <textarea
              autoFocus
              placeholder="What's on your mind?"
              disabled={isBusy}
              className="w-full bg-transparent text-white placeholder-white/40 text-center text-3xl sm:text-4xl font-bold outline-none resize-none px-4 disabled:opacity-60 leading-relaxed"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
            />

            {/* Color Palette Picker */}
            <div className="absolute bottom-6 flex items-center gap-2.5 p-2 rounded-full glass-panel border border-white/15 bg-black/30 backdrop-blur-md">
              {BG_COLORS.map((c) => (
                <button
                  key={c}
                  disabled={isBusy}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    background === c
                      ? "border-cyan-400 scale-110 shadow-lg shadow-cyan-400/50"
                      : "border-white/30 hover:border-white/70"
                  } disabled:opacity-50`}
                  style={{ backgroundColor: c }}
                  onClick={() => setBackground(c)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full max-w-2xl mx-auto flex items-center justify-center">
            {preview ? (
              type === "video" ? (
                <video
                  src={preview}
                  controls
                  className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/15"
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/15"
                />
              )
            ) : (
              <div className="glass-card p-10 rounded-3xl text-center max-w-md w-full border border-white/15">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4">
                  <FiImage size={32} />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Upload Status Media</h4>
                <p className="text-sm text-white/50 mb-1">
                  Select a photo or short video to share with friends
                </p>
                <p className="text-xs text-white/30 mb-6">
                  Maximum file size: 5 MB
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBusy}
                  className="btn-glow px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 disabled:opacity-50"
                >
                  Choose Media
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Send Button */}
      {((type === "text" && content.trim()) ||
        (type !== "text" && selectedFile)) && (
        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
          {isBusy && (
            <span className="text-white text-xs font-semibold glass-panel px-4 py-2 rounded-full border border-white/15 animate-pulse">
              {type === "text" ? "Sharing..." : "Uploading & Sharing..."}
            </span>
          )}
          <button
            type="button"
            onClick={handlePost}
            disabled={isBusy}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-blue-600 via-cyan-500 to-purple-600 shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isBusy ? (
              <span className="loading loading-spinner" />
            ) : (
              <FiSend size={22} className="ml-0.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateStatusModal;
