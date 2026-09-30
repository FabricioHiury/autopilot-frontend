import React from 'react';

interface IconFilterProps extends React.SVGProps<SVGSVGElement> {}

const IconFilter: React.FC<IconFilterProps> = ({ stroke="#FEFEFE", width=18, height=18, ...props}: IconFilterProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 19 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_2707_83584)">
        <path
          d="M3.78564 7.57115C3.78564 7.95003 3.93615 8.31339 4.20406 8.5813C4.47197 8.84921 4.83534 8.99972 5.21422 8.99972C5.5931 8.99972 5.95646 8.84921 6.22437 8.5813C6.49228 8.31339 6.64279 7.95003 6.64279 7.57115C6.64279 7.19227 6.49228 6.82891 6.22437 6.561C5.95646 6.29309 5.5931 6.14258 5.21422 6.14258C4.83534 6.14258 4.47197 6.29309 4.20406 6.561C3.93615 6.82891 3.78564 7.19227 3.78564 7.57115Z"
          stroke={stroke}
          strokeWidth="1.07143"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.21436 3.2854V6.14254"
          stroke={stroke}
          strokeWidth="1.07143"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.21436 8.99976V14.714"
          stroke={stroke}
          strokeWidth="1.07143"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.07153 11.8568C8.07153 12.2357 8.22204 12.599 8.48995 12.8669C8.75786 13.1349 9.12122 13.2854 9.5001 13.2854C9.87899 13.2854 10.2423 13.1349 10.5103 12.8669C10.7782 12.599 10.9287 12.2357 10.9287 11.8568C10.9287 11.4779 10.7782 11.1146 10.5103 10.8466C10.2423 10.5787 9.87899 10.4282 9.5001 10.4282C9.12122 10.4282 8.75786 10.5787 8.48995 10.8466C8.22204 11.1146 8.07153 11.4779 8.07153 11.8568Z"
          stroke={stroke}
          strokeWidth="1.07143"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 3.2854V10.4283"
          stroke={stroke}
          strokeWidth="1.07143"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 13.2854V14.714"
          stroke="#FEFEFE"
          strokeWidth="1.07143"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.3572 5.42833C12.3572 5.80721 12.5077 6.17057 12.7756 6.43848C13.0435 6.70639 13.4069 6.8569 13.7857 6.8569C14.1646 6.8569 14.528 6.70639 14.7959 6.43848C15.0638 6.17057 15.2143 5.80721 15.2143 5.42833C15.2143 5.04945 15.0638 4.68608 14.7959 4.41817C14.528 4.15027 14.1646 3.99976 13.7857 3.99976C13.4069 3.99976 13.0435 4.15027 12.7756 4.41817C12.5077 4.68608 12.3572 5.04945 12.3572 5.42833Z"
          stroke={stroke}
          strokeWidth="1.07143"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.7856 3.2854V3.99969"
          stroke={stroke}
          strokeWidth="1.07143"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.7856 6.85693V14.7141"
          stroke={stroke}
          strokeWidth="1.07143"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2707_83584">
          <rect
            width="17.1429"
            height="17.1429"
            fill="white"
            transform="translate(0.928467 0.428467)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default IconFilter;