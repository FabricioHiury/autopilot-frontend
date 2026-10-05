export interface IconLineDownProps {
  fill?: string;
  size?: number;
  className?: string;
}
export const IconLineDown = ({
  fill = 'currentColor',
  size = 24,
  className = '',
}: IconLineDownProps) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="62" height="21" viewBox="0 0 62 21" fill="none">
      <path
        d="M60.2812 19.25C60.2812 19.25 54.9672 7.89059 48.8619 11.3917C42.7566 14.8929 37.0649 14.9422 27.7376 4.32641C18.4103 -6.28935 11.4568 14.8299 1.28125 4.32641"
        stroke="url(#paint0_linear_766_91672)"
        strokeWidth="2.37343"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="paint0_linear_766_91672"
          x1="4.39293"
          y1="-8.31437"
          x2="21.3414"
          y2="34.5609"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF3030" stopOpacity="0.01" />
          <stop offset="1" stopColor="#F97272" />
        </linearGradient>
      </defs>
    </svg>
  );
};
