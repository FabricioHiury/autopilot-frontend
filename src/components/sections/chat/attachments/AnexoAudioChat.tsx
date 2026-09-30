'use client'

import React, { useEffect, useRef, useState } from 'react';
import { AudioSpectrum } from '../audio/AudioSpectrum';

function formatTime(seconds: number) {
  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function AnexoAudioChat({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    function onLoadedMetadata() {
      if (typeof audioEl!.duration !== 'number' || !isFinite(audioEl!.duration)) {
        setDuration(0);
        return;
      }
      setDuration(audioEl!.duration);
    }

    function onTimeUpdate() {
      if (audioEl!.currentTime === 0) {
        setCurrentTime(0);
        return;
      }
      setCurrentTime(audioEl!.currentTime);
    }

    function onEnded() {
      setIsPlaying(false);
      setCurrentTime(0);
    }

    audioEl.addEventListener('loadedmetadata', onLoadedMetadata);
    audioEl.addEventListener('timeupdate', onTimeUpdate);
    audioEl.addEventListener('ended', onEnded);

    return () => {
      audioEl.removeEventListener('loadedmetadata', onLoadedMetadata);
      audioEl.removeEventListener('timeupdate', onTimeUpdate);
      audioEl.removeEventListener('ended', onEnded);
    };
  }, []);

  function togglePlay() {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }

  function handleSeek(newTime: number) {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }

  return (
    <div className="p-4 bg-gray-200 rounded-xl flex flex-col gap-2 w-full max-w-sm">
      <audio ref={audioRef} src={src} />
      <div className="flex items-center justify-between flex-wrap w-full">
        <button onClick={togglePlay} className="bg-white text-[#283855] rounded-full w-10 h-10 flex items-center justify-center">
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z" />
            </svg>
          )}
        </button>

        <div className="flex-1 mx-3 min-w-[160px]">
          <AudioSpectrum
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            activeColor="#d33632"
            inactiveColor="#7F8999"
            height={30}
          />
        </div>

        <div className="flex justify-between text-sm text-gray-700 min-w-[60px] text-right">
          {isPlaying ? (
            <span>{formatTime(currentTime) || '-'}</span>
          ) : (
            <span>{formatTime(duration) || '-'}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnexoAudioChat;


