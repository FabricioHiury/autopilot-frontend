import * as React from 'react';
import { SVGProps } from "react";

export default function IconCalendar({fill = '#434D56', ...props}: SVGProps<SVGSVGElement>){
    return(
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="2"
                stroke={fill}
                strokeWidth="1.5"
                fill="none"
            />
            <path
                d="M4 8H20"
                stroke={fill}
                strokeWidth="1.5"
            />
            <path
                d="M8 2L8 6"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M16 2L16 6"
                stroke={fill}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <text
                x="12"
                y="16"
                textAnchor="middle"
                fill={fill}
                fontSize="8"
                fontWeight="bold"
            >
                31
            </text>
        </svg>
    ) 
}