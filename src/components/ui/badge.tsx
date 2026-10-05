import * as React from 'react';
import { cn } from '@/lib/class-name.utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
    const variantClasses = {
      default: 'bg-green-100 text-green-800',
      secondary: 'bg-gray-100 text-gray-800',
      destructive: 'bg-red-100 text-red-800',
      outline: 'border border-gray-200 bg-white text-gray-800',
    };

    return (
      <div ref={ref} className={cn(baseClasses, variantClasses[variant], className)} {...props} />
    );
  },
);
Badge.displayName = 'Badge';

export { Badge };
