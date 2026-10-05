export interface IconEditarProps {
  size?: number;
  color?: string;
}

export default function IconEditar({
  size = 18,
  color = 'hsl(var(--secondary))',
}: IconEditarProps) {
  const stroke = size * 0.0833;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 15.5H6L13.875 7.62498C14.072 7.428 14.2282 7.19415 14.3348 6.93678C14.4415 6.67941 14.4963 6.40356 14.4963 6.12498C14.4963 5.84641 14.4415 5.57056 14.3348 5.31319C14.2282 5.05582 14.072 4.82197 13.875 4.62498C13.678 4.428 13.4442 4.27174 13.1868 4.16514C12.9294 4.05853 12.6536 4.00366 12.375 4.00366C12.0964 4.00366 11.8206 4.05853 11.5632 4.16514C11.3058 4.27174 11.072 4.428 10.875 4.62498L3 12.5V15.5Z"
        stroke="hsl(var(--secondary))"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.125 5.375L13.125 8.375"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
