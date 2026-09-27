import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { FiX, FiCheck, FiRotateCcw } from 'react-icons/fi';

const ImageCropper = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-base-100 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh] md:h-[600px] animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h3 className="font-semibold text-lg">Crop Profile Picture</h3>
          <button onClick={onCancel} className="p-2 hover:bg-base-200 rounded-full transition-colors">
            <FiX size={20} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative flex-1 bg-black w-full">
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
        <div className="p-4 space-y-4 bg-base-100">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium w-12 text-base-content/70">Zoom</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(e.target.value)}
              className="range range-xs range-primary flex-1"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium w-12 text-base-content/70">Rotate</span>
            <input
              type="range"
              value={rotation}
              min={0}
              max={360}
              step={1}
              onChange={(e) => setRotation(e.target.value)}
              className="range range-xs range-primary flex-1"
            />
            <button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="p-2 hover:bg-base-200 rounded-full text-base-content/70 hover:text-base-content"
              title="Rotate 90°"
            >
              <FiRotateCcw size={18} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onCancel} className="btn btn-ghost" disabled={isProcessing}>
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary" disabled={isProcessing}>
              {isProcessing ? <span className="loading loading-spinner loading-sm"></span> : <FiCheck size={18} />}
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
