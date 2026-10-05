export interface IconAtendimentoProps {
  fill?: string;
  size?: number;
  className?: string;
}

export default function IconAtendimento({
  size = 16,
  fill = 'currentColor',
  className,
}: IconAtendimentoProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="9.99984" cy="4.99984" r="3.33333" stroke="white" strokeWidth="1.5" />
      <path
        d="M15 7.50016C16.3807 7.50016 17.5 6.56742 17.5 5.41683C17.5 4.26624 16.3807 3.3335 15 3.3335"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5 7.50016C3.61929 7.50016 2.5 6.56742 2.5 5.41683C2.5 4.26624 3.61929 3.3335 5 3.3335"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <ellipse cx="10" cy="14.1668" rx="5" ry="3.33333" stroke="white" strokeWidth="1.5" />
      <path
        d="M16.6665 15.8332C18.1284 15.5126 19.1665 14.7007 19.1665 13.7498C19.1665 12.7989 18.1284 11.9871 16.6665 11.6665"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.3335 15.8332C1.87162 15.5126 0.833496 14.7007 0.833496 13.7498C0.833496 12.7989 1.87162 11.9871 3.3335 11.6665"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
