'use client';
import AvatarUser from '@/components/commons/avatar-user';
import { relativeTime } from '@/lib/relative-time';
import { useState } from 'react';

export interface DealComment {
  id: string;
  dealId: string;
  userId: string;
  name: string;
  avatar: string;
  createdAt: Date;
  comment: string;
}

export interface ComentariosProps {
  comments: DealComment[];
}

export function Comentarios({ comments }: ComentariosProps) {
  const [sliceLevel, setSliceLevel] = useState<number>(2);

  const parseLineBreaks = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => (
      <span key={index}>
        {line}
        {index !== lines.length - 1 && <br />}
      </span>
    ));
  };
  const formatText = (text: string) => {
    const regex = /<br\s*\/?>/gi;
    const formattedText = text.replace(regex, '\n');
    return parseLineBreaks(formattedText);
  };

  return (
    <div className="flex flex-col max-h-[300px] pr-3 scroll-padrao overflow-y-auto w-full gap-4">
      {comments.slice(0, sliceLevel).map((comment) => (
        <Comentario key={comment.id} {...comment} />
      ))}

      {comments.slice(sliceLevel).length > 0 && (
        <div className="border-t flex items-center justify-center mt-4">
          <button
            onClick={() => setSliceLevel((old) => (old += 3))}
            className="w-1/5 min-w-fit px-4 text-[#485B80] text-sm -mt-3 bg-[#F2F4F7]"
          >
            Ver ({comments.slice(sliceLevel).length}) comentários mais antigos
          </button>
        </div>
      )}
    </div>
  );
}

export function Comentario({ name, avatar, createdAt: date, comment: content }: DealComment) {
  return (
    <div className="w-full flex gap-4 text-sm text-[hsl(var(--secondary))]">
      <AvatarUser name={name} src={avatar} />
      <div className="w-full">
        <div className="flex gap-2 items-center pb-1.6 text-xs">
          <div className="font-semibold">{name}</div>
          <div>
            <svg
              width="4"
              height="5"
              viewBox="0 0 4 5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="2" cy="2.5" r="2" fill="#485B80" />
            </svg>
          </div>
          <div>{relativeTime(date)}</div>
        </div>
        <div className="bg-white w-full rounded-[0.5rem] px-3 py-4 border border-[#DDE6F2] text-[#485B80] whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
}
