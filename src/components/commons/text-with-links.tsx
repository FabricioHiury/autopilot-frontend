import { cn } from '@/lib/class-name.utils';
import React from 'react';

export function TextWithLinks(text: string, className?: string): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const matches = Array.from(text.matchAll(urlRegex));

  if (matches.length === 0) {
    return text;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const maxUrlLength = 40;

  for (const match of matches) {
    const url = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    const displayText = url.length > maxUrlLength ? `${url.slice(0, maxUrlLength)}...` : url;

    parts.push(
      <a
        key={index}
        href={url}
        target="_blank"
        rel="noreferrer"
        className={cn('text-red-600 underline', className)}
        title={url}
      >
        {displayText}
      </a>,
    );

    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
