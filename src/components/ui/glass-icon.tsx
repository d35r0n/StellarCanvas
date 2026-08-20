import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface GlassIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  iconClassName?: string;
}

const sizeClasses = {
  sm: 'h-11 w-11 rounded-xl [&>svg]:h-5 [&>svg]:w-5',
  md: 'h-14 w-14 rounded-2xl [&>svg]:h-6 [&>svg]:w-6',
  lg: 'h-16 w-16 rounded-2xl [&>svg]:h-7 [&>svg]:w-7',
} as const;

export function GlassIcon({
  icon: Icon,
  size = 'md',
  className,
  iconClassName,
}: GlassIconProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center border border-white/10 bg-white/5 backdrop-blur-xl',
        sizeClasses[size],
        className,
      )}
    >
      <Icon className={cn('text-primary', iconClassName)} />
    </div>
  );
}
