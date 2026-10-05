'use client';
export function CopilotQuickReplies({
  replies,
  onSelect,
  disabled = false,
}: {
  replies: string[];
  onSelect: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto py-2" aria-label="Sugestões de resposta da IA">
      {replies.map((text, index) => (
        <button
          key={`${index}-${text}`}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(text)}
          className="text-left text-sm border border-primary/30 rounded-xl px-3 py-2 bg-primary/5 hover:bg-primary/10 disabled:opacity-50 min-w-[180px] max-w-[300px] shrink-0"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
