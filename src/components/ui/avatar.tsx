import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}

export function Avatar({ name, className, size = 'md', color }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white shrink-0',
        sizeClasses[size],
        color ?? 'bg-primary',
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
