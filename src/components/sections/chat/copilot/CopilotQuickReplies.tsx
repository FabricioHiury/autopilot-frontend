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
    <div className="grid gap-2 py-2" aria-label="Sugestões de resposta da IA">
      {replies.map((text, index) => (
        <button
          key={`${index}-${text}`}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(text)}
          className="w-full break-words rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5 text-left text-sm text-secondary transition-colors hover:border-primary/30 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
