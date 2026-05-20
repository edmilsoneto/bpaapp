import * as React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-neutral-800 animate-pulse rounded',
        className
      )}
    />
  );
}

export default Skeleton;
