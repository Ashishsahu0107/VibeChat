import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import { FiX, FiCheck, FiRotateCcw, FiCrop } from "react-icons/fi";

const ImageCropper = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteHandler = useCallback(
    (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
      );
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fade-in">
      <div className="glass-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col h-[80vh] md:h-[620px] bg-slate-950/85">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FiCrop size={16} />
            </div>
            <h3 className="font-semibold text-lg text-white">Crop Profile Picture</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 bg-black/60 w-full overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>

        {/* Controls */}
        <div className="p-6 space-y-4 border-t border-white/10 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60 w-14">
              Zoom
            </span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(e.target.value)}
              className="range range-xs accent-cyan-400 flex-1"
            />
            <span className="text-xs font-mono text-cyan-400 w-8 text-right">
              {Number(zoom).toFixed(1)}x
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60 w-14">
              Rotate
            </span>
            <input
              type="range"
              value={rotation}
              min={0}
              max={360}
              step={1}
              onChange={(e) => setRotation(e.target.value)}
              className="range range-xs accent-purple-400 flex-1"
            />
            <button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white border border-white/10 transition-colors"
              title="Rotate 90°"
            >
              <FiRotateCcw size={16} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={onCancel}
              className="btn-glass px-5 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:text-white transition-all"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-glow px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <FiCheck size={18} />
              )}
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
