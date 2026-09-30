'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface AudioSpectrumProps {
    currentTime: number;
    duration: number;
    onSeek: (newTime: number) => void;
    activeColor?: string;
    inactiveColor?: string;
    width?: number;
    height?: number;
}

export const AudioSpectrum: React.FC<AudioSpectrumProps> = ({
    currentTime,
    duration,
    onSeek,
    activeColor = '#d33632',
    inactiveColor = '#7F8999',
    width,
    height = 32,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(width || 200);

    useEffect(() => {
        if (width) return;
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const cw = Math.max(120, Math.floor(entry.contentRect.width));
                setContainerWidth(cw);
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [width]);

    const totalWidth = width ?? containerWidth;

    const barWidth = 4;
    const barGap = 2;
    const barsCount = Math.max(24, Math.floor(totalWidth / (barWidth + barGap)));

    const fraction = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

    const heights = useMemo(() => {
        const base: number[] = [];
        for (let i = 0; i < barsCount; i++) {
            const t = (i / barsCount) * Math.PI;
            const amp = 0.6 + 0.4 * Math.abs(Math.sin(t * 2.2));
            base.push(Math.max(0.35, Math.min(1, amp)));
        }
        return base;
    }, [barsCount]);

    const seekByFraction = useCallback((fx: number) => {
        const newFx = Math.min(1, Math.max(0, fx));
        onSeek(newFx * duration);
    }, [duration, onSeek]);

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        seekByFraction(clickX / rect.width);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!duration) return;
        const step = 5;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onSeek(Math.max(0, currentTime - step));
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            onSeek(Math.min(duration, currentTime + step));
        }
        if (e.key === 'Home') {
            e.preventDefault();
            onSeek(0);
        }
        if (e.key === 'End') {
            e.preventDefault();
            onSeek(duration);
        }
    };

    const bars = useMemo(() => {
        const items: JSX.Element[] = [];
        for (let i = 0; i < barsCount; i++) {
            const x = i * (barWidth + barGap);
            const isActive = fraction >= (i + 1) / barsCount;
            const h = Math.round(heights[i] * height);
            const y = Math.max(0, (height - h) / 2);
            items.push(
                <rect
                    key={i}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={h}
                    fill={isActive ? activeColor : inactiveColor}
                    rx={1}
                    ry={1}
                />
            );
        }
        return items;
    }, [barsCount, barWidth, barGap, fraction, heights, height, activeColor, inactiveColor]);

    const svgWidth = barsCount * barWidth + (barsCount - 1) * barGap;

    return (
        <div
            ref={containerRef}
            className="inline-block outline-none"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Linha do tempo do áudio"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={duration || 0}
            aria-valuenow={currentTime || 0}
            style={{ cursor: 'pointer' }}
        >
            <svg
                width={svgWidth}
                height={height}
                onClick={handleClick}
                xmlns="http://www.w3.org/2000/svg"
            >
                {bars}
            </svg>
        </div>
    );
};

export default AudioSpectrum;


