import { cn } from '@/lib/utils/cn';

/**
 * Логотип MacFlow.
 *
 * Два варианта: полный (иконка + текст) и компактный (только иконка).
 */
export function Logo({
  variant = 'full',
  className,
  showText = true,
}: {
  variant?: 'full' | 'compact';
  className?: string;
  showText?: boolean;
}) {
  const isCompact = variant === 'compact' || !showText;

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative inline-flex size-9 items-center justify-center overflow-hidden rounded-xl shadow-[0_8px_24px_-10px_var(--brand-glow)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/macflow-icon.svg" alt="" className="size-9" width={36} height={36} />
      </span>
      {!isCompact && (
        <span className="text-foreground text-[17px] font-bold tracking-tight">MacFlow</span>
      )}
    </span>
  );
}
