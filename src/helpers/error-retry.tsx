import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RefreshCcw } from 'lucide-react';

export function ErrorMessageButtonRetry({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn('mx-auto mb-2 flex flex-col items-center gap-2', className)}
    >
      <p className="text-xs text-destructive">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCcw />
        Retry
      </Button>
    </div>
  );
}
