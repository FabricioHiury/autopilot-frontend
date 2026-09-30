'use client';

import React, { useState } from 'react';
import { TextWithLinks } from '@/components/commons/text-with-links';

type Token =
    | { type: 'codeblock'; lang?: string; content: string }
    | { type: 'inlinecode'; content: string }
    | { type: 'text'; content: string };

function tokenize(text: string): Token[] {
    if (!text) return [];
    const tokens: Token[] = [];
    let lastIndex = 0;

    const codeBlockRegex = /```([a-zA-Z0-9]+)?\n?([\s\S]*?)```/g;
    let match: RegExpExecArray | null;
    while ((match = codeBlockRegex.exec(text)) !== null) {
        const index = match.index;
        if (index > lastIndex) {
            tokens.push({ type: 'text', content: text.slice(lastIndex, index) });
        }
        tokens.push({ type: 'codeblock', lang: match[1], content: match[2] ?? '' });
        lastIndex = index + match[0].length;
    }

    if (lastIndex < text.length) {
        tokens.push({ type: 'text', content: text.slice(lastIndex) });
    }

    const final: Token[] = [];
    for (const t of tokens) {
        if (t.type !== 'text') {
            final.push(t);
            continue;
        }
        const segment = t.content;
        let li = 0;
        const inlineCodeRegex = /`([^`]+)`/g;
        let m: RegExpExecArray | null;
        while ((m = inlineCodeRegex.exec(segment)) !== null) {
            const idx = m.index;
            if (idx > li) final.push({ type: 'text', content: segment.slice(li, idx) });
            final.push({ type: 'inlinecode', content: m[1] });
            li = idx + m[0].length;
        }
        if (li < segment.length) final.push({ type: 'text', content: segment.slice(li) });
    }

    return final;
}

function applyInlineFormatting(plain: string, linkClassName?: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    let cursor = 0;

    const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
    const urlMatches: { start: number; end: number }[] = [];
    let urlMatch: RegExpExecArray | null;
    while ((urlMatch = urlRegex.exec(plain)) !== null) {
        urlMatches.push({
            start: urlMatch.index,
            end: urlMatch.index + urlMatch[0].length
        });
    }

    const isInsideUrl = (index: number): boolean => {
        return urlMatches.some(url => index >= url.start && index < url.end);
    };

    const re = /(\*[^*\n]+\*)|(_[^_\n]+_)|(~[^~\n]+~)/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(plain)) !== null) {
        const idx = match.index;

        if (isInsideUrl(idx)) {
            continue;
        }

        if (idx > cursor) {
            const slice = plain.slice(cursor, idx);
            nodes.push(TextWithLinks(slice, linkClassName));
        }
        const token = match[0];
        const wrapper = token[0];
        const content = token.slice(1, -1);
        if (wrapper === '*') {
            nodes.push(<strong key={`b-${idx}`}>{TextWithLinks(content, linkClassName)}</strong>);
        } else if (wrapper === '_') {
            nodes.push(<em key={`i-${idx}`}>{TextWithLinks(content, linkClassName)}</em>);
        } else if (wrapper === '~') {
            nodes.push(<span key={`s-${idx}`} style={{ textDecoration: 'line-through' }}>{TextWithLinks(content, linkClassName)}</span>);
        }
        cursor = idx + token.length;
    }

    if (cursor < plain.length) {
        nodes.push(TextWithLinks(plain.slice(cursor), linkClassName));
    }

    return nodes;
}

function renderTextWithBlocks(plain: string, linkClassName?: string): React.ReactNode[] {
    const out: React.ReactNode[] = [];
    const lines = plain.split(/\r?\n/);
    let i = 0;

    const pushParagraph = (text: string) => {
        if (text.length === 0) {
            out.push(<br key={`br-${out.length}`} />);
            return;
        }
        out.push(<React.Fragment key={`p-${out.length}`}>{applyInlineFormatting(text, linkClassName)}</React.Fragment>);
    };

    while (i < lines.length) {
        const line = lines[i];

        if (/^>\s?/.test(line)) {
            const quoteLines: string[] = [];
            while (i < lines.length && /^>\s?/.test(lines[i])) {
                quoteLines.push(lines[i].replace(/^>\s?/, ''));
                i++;
            }
            const content = quoteLines.join('\n');
            out.push(
                <div key={`q-${out.length}`} className="pl-3 border-l-2 border-[#c7d2fe] my-1 text-[0.95em]">
                    {applyInlineFormatting(content, linkClassName)}
                </div>
            );
            continue;
        }

        if (/^[-*•]\s+/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^[-*•]\s+/, ''));
                i++;
            }
            out.push(
                <ul key={`ul-${out.length}`} className="list-disc pl-5 space-y-1">
                    {items.map((it, idx) => (
                        <li key={idx}>{applyInlineFormatting(it, linkClassName)}</li>
                    ))}
                </ul>
            );
            continue;
        }

        if (/^\d+\.\s+/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^\d+\.\s+/, ''));
                i++;
            }
            out.push(
                <ol key={`ol-${out.length}`} className="list-decimal pl-5 space-y-1">
                    {items.map((it, idx) => (
                        <li key={idx}>{applyInlineFormatting(it, linkClassName)}</li>
                    ))}
                </ol>
            );
            continue;
        }

        pushParagraph(line);
        if (i < lines.length - 1) {
            out.push(<br key={`line-br-${out.length}`} />);
        }
        i++;
    }

    return out;
}

export function formatMessageText(text: string, linkClassName?: string): React.ReactNode {
    const tokens = tokenize(text);
    const parts: React.ReactNode[] = [];

    tokens.forEach((t, i) => {
        if (t.type === 'codeblock') {
            parts.push(
                <CodeBlockCard key={`cb-${i}`} content={t.content} lang={t.lang} />
            );
            return;
        }
        if (t.type === 'inlinecode') {
            parts.push(
                <code key={`ic-${i}`} className="bg-[#e2e6ec] text-[#283855] text-[12px] rounded px-1 py-0.5">
                    {t.content}
                </code>
            );
            return;
        }

        parts.push(<React.Fragment key={`t-${i}`}>{renderTextWithBlocks(t.content, linkClassName)}</React.Fragment>);
    });

    return <>{parts}</>;
}

export default formatMessageText;


function CodeBlockCard({ content, lang }: { content: string; lang?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="rounded-md border border-slate-700 bg-slate-900 text-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 text-[11px] uppercase tracking-wider">
                <span className="opacity-80">{lang || 'code'}</span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2 py-0.5 rounded border border-slate-600 hover:bg-slate-700 transition text-[11px]"
                    aria-label="Copiar código"
                >
                    {copied ? 'Copiado' : 'Copiar'}
                </button>
            </div>
            <pre className="p-3 overflow-auto text-xs whitespace-pre-wrap">
                <code>{content}</code>
            </pre>
        </div>
    );
}


