import React, { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause } from 'react-icons/fi';

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

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
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
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex items-center gap-3 w-full max-w-[250px] min-w-[200px]">
      <button 
        type="button"
        onClick={togglePlayPause} 
        className="opacity-80 hover:opacity-100 text-current"
      >
        {isPlaying ? <FiPause size={24} className="fill-current" /> : <FiPlay size={24} className="fill-current" />}
      </button>
      
      <div className="flex flex-col flex-1 w-full relative pt-2">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={isNaN(progress) ? 0 : progress} 
          onChange={handleSeek} 
          className="range range-xs range-primary w-full"
        />
        <div className="flex justify-between mt-1 absolute -bottom-3 w-full">
          <span className="text-[10px] opacity-70 text-current">{formatTime(audioRef.current?.currentTime || 0)}</span>
        </div>
      </div>
      
      <audio ref={audioRef} src={src} className="hidden" />
    </div>
  );
};

export default CustomAudioPlayer;

