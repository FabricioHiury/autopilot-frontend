'use client';

import IconEnviar from '@/components/icons/icon-enviar';
import { useEffect, useRef, useState } from 'react';

interface PreviewAudioProps {
  src: string;
  onCancel: () => void;
  onSend: () => void;
}

export function PreviewAudio({ src, onCancel, onSend }: PreviewAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  function formatTime(seconds: number) {
    const mm = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const ss = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${mm}:${ss}`;
  }

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    function onLoadedMetadata() {
      // verificar se o durantion é um número valido excluindo NaN e Infinity
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
    <div className="w-full h-12 px-3 py-2 bg-[#dce5f1] rounded-lg flex-col justify-center items-center gap-2 inline-flex">
      <audio ref={audioRef} src={src} />
      <div className="w-full justify-between items-center inline-flex">
        <div className="justify-start items-center gap-1.5 flex">
          <button className="w-5 h-5 relative  overflow-hidden text-[#24ae6b]" onClick={togglePlay}>
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M80,128V64a48,48,0,0,1,96,0v64a48,48,0,0,1-96,0Zm128,0a8,8,0,0,0-16,0,64,64,0,0,1-128,0,8,8,0,0,0-16,0,80.11,80.11,0,0,0,72,79.6V240a8,8,0,0,0,16,0V207.6A80.11,80.11,0,0,0,208,128Z"></path>
              </svg>
            )}
          </button>
          <div className="w-44 text-[#485b7f] text-sm font-medium leading-tight">
            {isPlaying ? (
              <span>{formatTime(currentTime) || '-'}</span>
            ) : (
              <span>{formatTime(duration) || '-'}</span>
            )}
          </div>
        </div>
        <div className="justify-start items-center gap-2.5 flex">
          <button className="w-5 h-5 relative  overflow-hidden" onClick={onCancel}>
            <svg
              width="21"
              height="20"
              viewBox="0 0 21 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.5 5.83332H4.66667V16.6667C4.66667 17.1087 4.84226 17.5326 5.15482 17.8452C5.46738 18.1577 5.89131 18.3333 6.33333 18.3333H14.6667C15.1087 18.3333 15.5326 18.1577 15.8452 17.8452C16.1577 17.5326 16.3333 17.1087 16.3333 16.6667V5.83332H5.5ZM14.3483 3.33332L13 1.66666H8L6.65167 3.33332H3V4.99999H18V3.33332H14.3483Z"
                fill="#939FB7"
              />
            </svg>
          </button>
          <button
            className="w-9 h-9 p-2.5 bg-[#24ae6b] rounded-md justify-center items-center gap-2.5 flex"
            onClick={onSend}
          >
            <div className="w-5 h-5 justify-center items-center flex overflow-hidden">
              <IconEnviar />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
