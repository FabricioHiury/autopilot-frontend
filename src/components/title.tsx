import * as React from 'react';
import { cn } from '@/lib/class-name.utils';

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  type?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  ({ className, type, children, ...props }, ref) => {
    if (type === 'h1') {
      return (
        <h1
          className={cn('text-[2rem] font-semibold leading-[2.4rem]', className)}
          ref={ref}
          {...props}
        >
          {children}
        </h1>
      );
    }

    if (type === 'h2') {
      return (
        <h2
          className={cn('text-lg font-semibold text-primary-foreground', className)}
          ref={ref}
          {...props}
        >
          {children}
        </h2>
      );
    }

    if (type === 'h3') {
      return (
        <h3
          className={cn('text-base font-semibold text-primary-foreground', className)}
          ref={ref}
          {...props}
        >
          {children}
        </h3>
      );
    }
  },
);

export { Title };
