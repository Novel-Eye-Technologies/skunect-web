import { Button } from '@/components/ui/button';

interface QueryErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryErrorBanner({
  message = 'Failed to load data. Please try again.',
  onRetry,
}: QueryErrorBannerProps) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
      <span>{message}</span>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
