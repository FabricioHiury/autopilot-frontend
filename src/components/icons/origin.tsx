export default function OriginIcon({
  size = 16,
  className = '',
  stroke = 1.5,
}: {
  size?: number;
  className?: string;
  stroke?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-labelledby="originIconTitle"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      color="currentColor"
    >
      <title id="originIconTitle">Origin</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19Z"
        stroke="currentColor"
      ></path>
      <path d="M12 2V8" stroke="currentColor"></path>
      <path d="M12 16V22" stroke="currentColor"></path>
      <path d="M2 12L8 12" stroke="currentColor"></path>
      <path d="M16 12L22 12" stroke="currentColor"></path>
      <circle cx="12" cy="12" r="1" stroke="currentColor"></circle>
    </svg>
  );
}
