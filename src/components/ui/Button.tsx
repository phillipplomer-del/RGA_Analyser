import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'btn-animate font-semibold rounded-full transition-all inline-flex items-center justify-center gap-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          // Variants
          variant === 'primary' && 'gradient-main text-text-inverse',
          variant === 'secondary' && 'bg-surface-card text-text-primary border border-subtle hover:bg-surface-card-muted',
          variant === 'ghost' && 'bg-transparent text-text-secondary hover:bg-surface-card-muted hover:text-text-primary',
          variant === 'danger' && 'bg-state-danger text-text-inverse hover:opacity-90',
          // Sizes
          size === 'sm' && 'px-4 py-2 text-caption',
          size === 'md' && 'px-6 py-3 text-body',
          size === 'lg' && 'px-8 py-4 text-body',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
