'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input type={type} className={cn(
        'flex h-7 w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#0f1011] px-2 py-0.5 text-xs ring-offset-[#08090a] file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40',
        className
      )} ref={ref} {...props} />
    );
  }
);
Input.displayName = 'Input';
export { Input };
