interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ children, ...props }: LabelProps) {
  return (
    <label className="text-[#485b7f] text-xs font-semibold" {...props}>
      {children}
    </label>
  );
}
