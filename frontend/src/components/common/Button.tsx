import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        {
          'bg-primary text-white hover:bg-primary-hover focus:ring-primary': variant === 'primary',
          'bg-secondary text-white hover:bg-secondary-hover focus:ring-secondary': variant === 'secondary',
          'bg-accent text-slate-900 hover:bg-accent-hover focus:ring-accent': variant === 'accent',
          'bg-transparent border-2 border-slate-200 hover:bg-slate-50 text-slate-900': variant === 'outline',
          'bg-transparent hover:bg-slate-100 text-slate-900': variant === 'ghost',
          'h-8 px-4 text-xs': size === 'sm',
          'h-10 px-6 py-2 text-sm': size === 'md',
          'h-12 px-8 text-base': size === 'lg',
          'w-full': fullWidth,
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
