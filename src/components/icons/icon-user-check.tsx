export interface IconUserCheckProps {
  fill?: string;
  size?: number;
  className?: string;
}

export default function IconUserCheck({
  size = 16,
  fill = 'currentColor',
  className,
}: IconUserCheckProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="21" viewBox="0 0 22 21" fill="none">
      <path
        d="M7.32129 6.21422C7.32129 7.12353 7.68251 7.9956 8.32549 8.63858C8.96848 9.28156 9.84055 9.64279 10.7499 9.64279C11.6592 9.64279 12.5312 9.28156 13.1742 8.63858C13.8172 7.9956 14.1784 7.12353 14.1784 6.21422C14.1784 5.3049 13.8172 4.43283 13.1742 3.78985C12.5312 3.14687 11.6592 2.78564 10.7499 2.78564C9.84055 2.78564 8.96848 3.14687 8.32549 3.78985C7.68251 4.43283 7.32129 5.3049 7.32129 6.21422Z"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.60742 18.2141V16.4999C5.60742 15.5905 5.96865 14.7185 6.61163 14.0755C7.25461 13.4325 8.12668 13.0713 9.03599 13.0713H12.036"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.7544 16.442L14.5381 18.2144L18.3989 13.6987"
        stroke="white"
        strokeWidth="1.69336"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
