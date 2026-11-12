import React, { useState, useEffect, useCallback } from "react";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiZoomIn,
  FiZoomOut,
  FiDownload,
} from "react-icons/fi";

const MediaViewerModal = ({ mediaList, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentMedia = mediaList[currentIndex];

  const handleNext = useCallback(
    (e) => {
      e?.stopPropagation();
      if (currentIndex < mediaList.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }
    },
    [currentIndex, mediaList.length],
  );

  const handlePrev = useCallback(
    (e) => {
      e?.stopPropagation();
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }
    },
    [currentIndex],
  );

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    setZoom((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // Drag handling
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!currentMedia) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center backdrop-blur-2xl animate-fade-in"
      onClick={onClose}
    >
      {/* Header Controls */}
      <div
        className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass-panel px-3.5 py-1.5 rounded-full text-white/80 font-mono text-xs border border-white/10 bg-black/30 backdrop-blur-md">
          {currentIndex + 1} / {mediaList.length}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {currentMedia.type === "image" && (
            <>
              <button
                onClick={handleZoomOut}
                className="glass-panel p-2.5 text-white/80 hover:text-white hover:bg-white/10 border border-white/10 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={zoom === 1}
                title="Zoom Out"
              >
                <FiZoomOut size={18} />
              </button>
              <button
                onClick={handleZoomIn}
                className="glass-panel p-2.5 text-white/80 hover:text-white hover:bg-white/10 border border-white/10 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={zoom === 4}
                title="Zoom In"
              >
                <FiZoomIn size={18} />
              </button>
            </>
          )}
          <a
            href={currentMedia.url}
            target="_blank"
            rel="noopener noreferrer"
            download={currentMedia.name || "media"}
            className="glass-panel p-2.5 text-white/80 hover:text-cyan-300 hover:bg-white/10 border border-white/10 rounded-full transition-all"
            title="Download Media"
          >
            <FiDownload size={18} />
          </a>
          <button
            onClick={onClose}
            className="glass-panel p-2.5 text-white hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 rounded-full transition-all ml-1"
            title="Close"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Prev */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white glass-panel hover:bg-white/20 border border-white/15 rounded-full transition-all z-10 shadow-2xl"
          title="Previous"
        >
          <FiChevronLeft size={28} />
        </button>
      )}

      {/* Media Content */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {currentMedia.type === "image" ? (
          <img
            src={currentMedia.url}
            alt="Viewer"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-transform duration-150"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            }}
            draggable={false}
          />
        ) : currentMedia.type === "video" ? (
          <video
            src={currentMedia.url}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/15 outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="glass-card p-6 rounded-2xl text-white text-center border border-white/15">
            <p className="text-sm font-medium">Unsupported media type</p>
          </div>
        )}
      </div>

      {/* Navigation Next */}
      {currentIndex < mediaList.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white glass-panel hover:bg-white/20 border border-white/15 rounded-full transition-all z-10 shadow-2xl"
          title="Next"
        >
          <FiChevronRight size={28} />
        </button>
      )}
    </div>
  );
};

export default MediaViewerModal;
