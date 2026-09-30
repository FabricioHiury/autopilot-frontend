import { SVGProps } from "react";

export default function PlansIcon({fill = 'currentColor', ...props}: SVGProps<SVGSVGElement>){
    return(
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M3.33398 5.83301C3.33398 4.91253 4.08022 4.16634 5.00065 4.16634H15.0007C15.9211 4.16634 16.6673 4.91253 16.6673 5.83301V14.1663C16.6673 15.0868 15.9211 15.833 15.0007 15.833H5.00065C4.08022 15.833 3.33398 15.0868 3.33398 14.1663V5.83301Z" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.334 7.5H6.66732" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.334 10H6.66732" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.0007 12.5H6.66732" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.6673 7.5L18.334 5.83301C18.334 4.91253 17.5878 4.16634 16.6673 4.16634" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.33398 7.5L1.66732 5.83301C1.66732 4.91253 2.41351 4.16634 3.33398 4.16634" stroke={fill} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}