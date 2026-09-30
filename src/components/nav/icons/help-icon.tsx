import { SVGProps } from "react";

export default function HelpIcon({fill = 'currentColor', ...props}: SVGProps<SVGSVGElement>){
    return(
        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.4993 18.3337C15.1017 18.3337 18.8327 14.6027 18.8327 10.0003C18.8327 5.39795 15.1017 1.66699 10.4993 1.66699C5.89698 1.66699 2.16602 5.39795 2.16602 10.0003C2.16602 14.6027 5.89698 18.3337 10.4993 18.3337Z" stroke={fill} strokeWidth="1.25"/>
            <path d="M8.83398 7.49967C8.83398 6.5792 9.58015 5.83301 10.5007 5.83301C11.4212 5.83301 12.1673 6.5792 12.1673 7.49967C12.1673 7.83147 12.0704 8.14062 11.9032 8.40034C11.4052 9.17442 10.5007 9.91251 10.5007 10.833V11.2497" stroke={fill} strokeWidth="1.25" strokeLinecap="round"/>
            <path d="M10.4941 14.167H10.5016" stroke={fill} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
}