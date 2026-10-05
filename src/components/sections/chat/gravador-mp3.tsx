'use client';

import { useEffect, useRef, useState } from 'react';
import { Recorder } from 'vmsg';

interface GravadorMp3Props {
  inputFileRef: React.RefObject<HTMLInputElement>;
  onRecordStart?: () => void;
  onRecordStop?: () => void;
}

export function GravadorMp3({ inputFileRef, onRecordStart, onRecordStop }: GravadorMp3Props) {
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<Recorder | null>(null);
  const [time, setTime] = useState(0);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    recorderRef.current = new Recorder({ wasmURL: '/wasm/vmsg.wasm' });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      // Reinicia o cronômetro ao iniciar a gravação
      setTime(0);
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleRecordToggle = async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    if (!isRecording) {
      // INICIAR GRAVAÇÃO
      try {
        await recorder.initAudio();
        await recorder.initWorker();
        recorder.startRecording();
        setIsRecording(true);
        onRecordStart?.();
      } catch (e) {
        console.error(e);
        setIsRecording(false);
      }
    } else {
      try {
        setIsRecording(false);

        // gravar mais 900 milisegundos para garantir que o audio não seja cortado
        await new Promise((resolve) => setTimeout(resolve, 900));

        const blob = await recorder.stopRecording();
        const file = new File([blob], 'recorded-audio.mp3', { type: 'audio/mpeg' });

        // Injetar no input file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        if (inputFileRef.current) {
          inputFileRef.current.files = dataTransfer.files;
          const changeEvent = new Event('change', { bubbles: true });
          inputFileRef.current.dispatchEvent(changeEvent);
        }
        setIsRecording(false);
        onRecordStop?.();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={handleRecordToggle}
        className="p-2 rounded-full flex items-center justify-center text-slate-400 hover:text-secondary-foreground hover:bg-[hsl(var(--secondary))] data-[recording=true]:text-secondary-foreground data-[recording=true]:bg-[hsl(var(--secondary))]"
        data-recording={isRecording}
      >
        {isRecording ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M216,56V200a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40H200A16,16,0,0,1,216,56Z"></path>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M80,128V64a48,48,0,0,1,96,0v64a48,48,0,0,1-96,0Zm128,0a8,8,0,0,0-16,0,64,64,0,0,1-128,0,8,8,0,0,0-16,0,80.11,80.11,0,0,0,72,79.6V240a8,8,0,0,0,16,0V207.6A80.11,80.11,0,0,0,208,128Z"></path>
          </svg>
        )}
      </button>

      {isRecording && (
        <div className="text-[#485b7f] text-sm font-semibold">{formatTime(time)}</div>
      )}
    </div>
  );
}
