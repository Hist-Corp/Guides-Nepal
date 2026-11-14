import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-slate-200 overflow-hidden',
        {
          'transition-shadow duration-300 hover:shadow-lg cursor-pointer': hoverEffect,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
