'use client';

import { useEffect, useRef, useState } from 'react';

interface GravadorMp4Props {
  inputFileRef: React.RefObject<HTMLInputElement>;
  onRecordStart?: () => void;
  onRecordStop?: () => void;
}

export function GravadorMp4({ inputFileRef, onRecordStart, onRecordStop }: GravadorMp4Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      setTime(0);
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      try {
        mediaRecorderRef.current?.stop();
      } catch {}
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const pickSupportedMime = (): { mime: string; ext: string } => {
    const candidates = [
      { mime: 'audio/mp4;codecs=mp4a.40.2', ext: 'mp4' },
      { mime: 'audio/mp4', ext: 'mp4' },
      { mime: 'audio/x-m4a', ext: 'm4a' },
      { mime: 'audio/aac', ext: 'aac' },
      { mime: 'audio/wav', ext: 'wav' },
    ];
    for (const c of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c.mime)) {
        return c;
      }
    }
    throw new Error('Nenhum formato de gravação suportado pelo navegador (mp4/m4a/aac/wav).');
  };

  const handleRecordToggle = async () => {
    if (!isRecording) {
      try {
        const { mime, ext } = pickSupportedMime();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        chunksRef.current = [];
        const recorder = new MediaRecorder(stream, { mimeType: mime });
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };
        // usar timeslice para garantir chunks
        recorder.start(1000);
        setIsRecording(true);
        onRecordStart?.();
      } catch (e) {
        console.error(e);
        setIsRecording(false);
      }
    } else {
      try {
        setIsRecording(false);
        const recorder = mediaRecorderRef.current;
        if (recorder) {
          const stopped = new Promise<void>((resolve) => {
            const onStop = () => {
              recorder.removeEventListener('stop', onStop as any);
              resolve();
            };
            recorder.addEventListener('stop', onStop as any, { once: true });
          });
          try { recorder.requestData?.(); } catch {}
          if (recorder.state !== 'inactive') recorder.stop();
          await stopped;
        }
        // Only stop tracks after recorder finalized
        mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
        const { mime, ext } = pickSupportedMime();
        const blob = new Blob(chunksRef.current.filter((b) => (b as Blob)?.size ?? 0), { type: mime });
        if (!blob || blob.size === 0) {
          throw new Error('Falha ao capturar áudio: blob vazio.');
        }
        const file = new File([blob], `recorded-audio.${ext}`, { type: mime });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        if (inputFileRef.current) {
          inputFileRef.current.files = dataTransfer.files;
          const changeEvent = new Event('change', { bubbles: true });
          inputFileRef.current.dispatchEvent(changeEvent);
        }
        onRecordStop?.();
      } catch (e) {
        console.error(e);
      } finally {
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        mediaStreamRef.current = null;
      }
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <button onClick={handleRecordToggle} className="p-2 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#293856] data-[recording=true]:text-white data-[recording=true]:bg-[#293856]" data-recording={isRecording}>
        {isRecording ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M216,56V200a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40H200A16,16,0,0,1,216,56Z"></path></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M80,128V64a48,48,0,0,1,96,0v64a48,48,0,0,1-96,0Zm128,0a8,8,0,0,0-16,0,64,64,0,0,1-128,0,8,8,0,0,0-16,0,80.11,80.11,0,0,0,72,79.6V240a8,8,0,0,0,16,0V207.6A80.11,80.11,0,0,0,208,128Z"></path></svg>
        )}
      </button>
      {isRecording && <div className="text-[#485b7f] text-sm font-semibold">{formatTime(time)}</div>}
    </div>
  );
}


