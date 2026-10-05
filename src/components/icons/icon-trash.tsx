interface IconTrashProps {
  size?: number;
  fill?: string;
  className?: string;
}

export default function IconTrash({
  size = 20,
  fill = 'currentColor',
  className = '',
}: IconTrashProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5 5.83342H4.16667V16.6667C4.16667 17.1088 4.34226 17.5327 4.65482 17.8453C4.96738 18.1578 5.39131 18.3334 5.83333 18.3334H14.1667C14.6087 18.3334 15.0326 18.1578 15.3452 17.8453C15.6577 17.5327 15.8333 17.1088 15.8333 16.6667V5.83342H5ZM13.8483 3.33341L12.5 1.66675H7.5L6.15167 3.33341H2.5V5.00008H17.5V3.33341H13.8483Z"
        fill={fill}
      />
    </svg>
  );
}
