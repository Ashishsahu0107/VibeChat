import React, { useState, useEffect, useCallback } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiDownload } from 'react-icons/fi';

const MediaViewerModal = ({ mediaList, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentMedia = mediaList[currentIndex];

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    if (currentIndex < mediaList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [currentIndex, mediaList.length]);

  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [currentIndex]);

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
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // Drag handling
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!currentMedia) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Header Controls */}
      <div 
        className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-white/80 font-medium text-sm">
          {currentIndex + 1} of {mediaList.length}
        </div>
        
        <div className="flex items-center gap-4">
          {currentMedia.type === 'image' && (
            <>
              <button onClick={handleZoomOut} className="p-2 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors" disabled={zoom === 1}>
                <FiZoomOut size={20} />
              </button>
              <button onClick={handleZoomIn} className="p-2 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors" disabled={zoom === 4}>
                <FiZoomIn size={20} />
              </button>
            </>
          )}
          <a
            href={currentMedia.url}
            target="_blank"
            rel="noopener noreferrer"
            download={currentMedia.name || 'media'}
            className="p-2 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors"
          >
            <FiDownload size={20} />
          </a>
          <button onClick={onClose} className="p-2 text-white hover:text-red-400 bg-black/40 rounded-full transition-colors ml-2">
            <FiX size={24} />
          </button>
        </div>
      </div>

      {/* Navigation Prev */}
      {currentIndex > 0 && (
        <button 
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-all z-10"
        >
          <FiChevronLeft size={32} />
        </button>
      )}

      {/* Media Content */}
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {currentMedia.type === 'image' ? (
          <img
            src={currentMedia.url}
            alt="Viewer"
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{ 
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            draggable={false}
          />
        ) : currentMedia.type === 'video' ? (
          <video
            src={currentMedia.url}
            controls
            autoPlay
            className="max-w-full max-h-full shadow-2xl outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="text-white text-center">
            <p>Unsupported media type</p>
          </div>
        )}
      </div>

      {/* Navigation Next */}
      {currentIndex < mediaList.length - 1 && (
        <button 
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-all z-10"
        >
          <FiChevronRight size={32} />
        </button>
      )}
    </div>
  );
};

export default MediaViewerModal;
