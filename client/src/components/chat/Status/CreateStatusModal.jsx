import React, { useState, useRef } from "react";
import { FiX, FiSend, FiImage, FiType } from "react-icons/fi";
import toast from "react-hot-toast";
import useStatusStore from "../../../store/useStatusStore";
import useChatStore from "../../../store/useChatStore";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const BG_COLORS = [
  "#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#9B59B6", "#1ABC9C", "#34495E", "#E67E22"
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
        await createStatus({ type: "text", content: content.trim(), background });
      } else {
        // Upload media first
        const uploaded = await uploadAttachment(selectedFile);
        await createStatus({ type, content: uploaded.url, background: "#000" });
      }
      onClose();
    } catch (err) {
      console.error("Error creating status:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to post status");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const isBusy = isSubmitting || isCreating;

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button 
          onClick={isBusy ? undefined : onClose} 
          disabled={isBusy}
          className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiX size={24} />
        </button>
        <div className="flex items-center gap-4">
          <button 
            disabled={isBusy}
            onClick={() => { setType("text"); setPreview(null); setSelectedFile(null); }} 
            className={`p-2 rounded-full ${type === "text" ? "bg-white/30" : "hover:bg-white/20"} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <FiType size={20} />
          </button>
          <button 
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()} 
            className={`p-2 rounded-full ${type !== "text" ? "bg-white/30" : "hover:bg-white/20"} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <FiImage size={20} />
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
            className="w-full h-full max-w-md mx-auto flex flex-col justify-center items-center transition-colors duration-300"
            style={{ backgroundColor: background }}
          >
            <textarea
              autoFocus
              placeholder="Type a status"
              disabled={isBusy}
              className="w-full bg-transparent text-white text-center text-3xl font-semibold outline-none resize-none px-4 disabled:opacity-60"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
            />
            {/* Color Picker */}
            <div className="absolute top-20 right-4 flex flex-col gap-2">
              {BG_COLORS.map(c => (
                <button 
                  key={c} 
                  disabled={isBusy}
                  className={`w-8 h-8 rounded-full border-2 ${background === c ? "border-white" : "border-transparent"} disabled:opacity-50`}
                  style={{ backgroundColor: c }}
                  onClick={() => setBackground(c)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full max-w-lg mx-auto flex items-center justify-center">
            {preview ? (
              type === "video" ? (
                <video src={preview} controls className="max-h-full max-w-full rounded-lg object-contain" />
              ) : (
                <img src={preview} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
              )
            ) : (
              <div className="text-white/50 text-center">
                <FiImage size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select an image or video to share</p>
                <p className="text-xs text-white/40 mt-1">Maximum file size: 5 MB</p>
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isBusy}
                  className="mt-4 btn btn-primary disabled:opacity-50"
                >
                  Choose File
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Send Button */}
      {((type === "text" && content.trim()) || (type !== "text" && selectedFile)) && (
        <div className="absolute bottom-8 right-8 z-10 flex items-center gap-3">
          {isBusy && (
            <span className="text-white text-sm bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md animate-pulse">
              {type === "text" ? "Posting..." : "Uploading & Posting..."}
            </span>
          )}
          <button 
            type="button"
            onClick={handlePost} 
            disabled={isBusy}
            className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isBusy ? <span className="loading loading-spinner" /> : <FiSend size={24} className="ml-1" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateStatusModal;
