interface IconDividerProps {
  fill?: string;
  size?: number;
}

export function IconDivider({ fill = 'currentColor', size = 45 }: IconDividerProps) {
  return (
    <svg width="2" height={size} viewBox="0 0 2 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 0.5L1 44.5" stroke={fill} strokeLinecap="round" />
    </svg>
  );
}
