import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'premium' | 'accent';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
}) => {
  const baseStyles = 'rounded-xl transition-all duration-300';
  
  const variants = {
    default: 'bg-white shadow-lg',
    premium: 'bg-white rounded-2xl shadow-xl border border-gray-100',
    accent: 'bg-gradient-to-br from-[#243989] to-[#3A52A8] text-white',
  };
  
  const hoverStyles = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
  
  return (
    <div className={cn(baseStyles, variants[variant], hoverStyles, className)}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('p-6 pb-4', className)}>{children}</div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('p-6 pt-4', className)}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('p-6 pt-4 border-t border-gray-100', className)}>{children}</div>
);
