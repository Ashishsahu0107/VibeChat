import React, { useState, useRef, useEffect } from "react";
import { FiPlay, FiPause } from "react-icons/fi";

const CustomAudioPlayer = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const seekTo = (e.target.value / 100) * duration;
    audio.currentTime = seekTo;
    setProgress(e.target.value);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="flex items-center gap-3 w-full max-w-[260px] min-w-[200px] glass-panel px-3.5 py-2.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
      <button
        type="button"
        onClick={togglePlayPause}
        className="w-8 h-8 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0 shadow-sm shadow-cyan-500/20"
      >
        {isPlaying ? (
          <FiPause size={14} className="fill-cyan-300" />
        ) : (
          <FiPlay size={14} className="fill-cyan-300 ml-0.5" />
        )}
      </button>

      <div className="flex flex-col flex-1 w-full relative pt-1">
        <input
          type="range"
          min="0"
          max="100"
          value={isNaN(progress) ? 0 : progress}
          onChange={handleSeek}
          className="range range-xs accent-cyan-400 w-full cursor-pointer h-1.5 bg-white/20 rounded-lg"
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-[10px] font-mono text-white/70">
            {formatTime(audioRef.current?.currentTime || 0)}
          </span>
          <span className="text-[10px] font-mono text-white/50">
            {formatTime(duration || 0)}
          </span>
        </div>
      </div>

      <audio ref={audioRef} src={src} className="hidden" />
    </div>
  );
};

export default CustomAudioPlayer;
