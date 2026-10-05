'use client';
import { useRouter } from 'next/navigation';

export default function GoBackPage({ label }: { label?: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 text-[#657380] text-[16px] font-normal">
      <button
        className="hover:-translate-x-1 duration-500 ease-in-out"
        onClick={() => router.back()}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 18C11.0506 18 12.0909 17.7931 13.0615 17.391C14.0321 16.989 14.914 16.3997 15.6569 15.6569C16.3997 14.914 16.989 14.0321 17.391 13.0615C17.7931 12.0909 18 11.0506 18 10C18 8.94943 17.7931 7.90914 17.391 6.93853C16.989 5.96793 16.3997 5.08601 15.6569 4.34315C14.914 3.60028 14.0321 3.011 13.0615 2.60896C12.0909 2.20693 11.0506 2 10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18Z"
            stroke="#434D56"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.44531 10L10.0009 13.5556"
            stroke="#434D56"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.44531 10H13.5564"
            stroke="#434D56"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10.0009 6.44434L6.44531 9.99989"
            stroke="#434D56"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {label || 'Voltar para página anterior'}
    </div>
  );
}
