"use client";

export default function IconTag({ size = 16, className = "", stroke = 1.5 }: { size?: number; className?: string; stroke?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      className={className}
    >
      <path d="M3 7a2 2 0 0 1 2-2h5.586a2 2 0 0 1 1.414.586l8.414 8.414a2 2 0 0 1 0 2.828l-3.172 3.172a2 2 0 0 1-2.828 0L6 11.586A2 2 0 0 1 5.414 10H5a2 2 0 0 1-2-2V7z" />
      <circle cx="7.5" cy="8.5" r="1.5" />
    </svg>
  );
}